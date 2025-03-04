import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the headers (with await to fix TypeScript errors)
    const headersList = await Promise.resolve(headers());
    const svix_id = headersList.get("svix-id") || '';
    const svix_timestamp = headersList.get("svix-timestamp") || '';
    const svix_signature = headersList.get("svix-signature") || '';
    
    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Missing svix headers', { status: 400 });
    }
    
    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return new Response('Missing webhook secret', { status: 500 });
    }

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);
    
    let evt: WebhookEvent;
    
    try {
      // Verify the webhook payload
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error verifying webhook', { status: 400 });
    }
    
    // Handle the different webhook events
    const eventType = evt.type;
    
    // Handle the different webhook events
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Generate URL slug from name or email
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();
      const email = email_addresses[0]?.email_address || '';
      const urlSlug = fullName 
        ? fullName.toLowerCase().replace(/\s+/g, '-') 
        : email.split('@')[0];
      
      // Get Supabase admin client
      const supabase = await createSupabaseAdmin();
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: id,
          email: email,
          full_name: fullName,
          avatar_url: image_url,
          is_active: true,
          profile_type: 'student', // Default profile type
          url_slug: urlSlug,
          page_title: fullName || 'User Profile',
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Error upserting user:', error);
        return new Response('Error upserting user', { status: 500 });
      }
    }
    
    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      // Get Supabase admin client
      const supabase = await createSupabaseAdmin();
      
      // Mark user as inactive in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', id);
      
      if (error) {
        console.error('Error marking user as inactive:', error);
        return new Response('Error marking user as inactive', { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 