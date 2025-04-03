import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
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
      console.error('Missing svix headers', { svix_id, svix_timestamp, svix_signature });
      return new Response('Missing svix headers', { status: 400 });
    }
    
    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Missing webhook secret');
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
    console.log(`📩 Webhook received: ${eventType}`, JSON.stringify(evt.data).substring(0, 100) + '...');
    
    // Get Supabase admin client
    const supabase = await createAdminClient();
    
    // Handle the different webhook events
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Generate URL slug from name or email
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();
      const email = email_addresses[0]?.email_address || '';
      const urlSlug = fullName 
        ? fullName.toLowerCase().replace(/\s+/g, '-') 
        : email.split('@')[0];
      
      // Create metadata for the profile with profile_needs_setup flag
      // This ensures new users are directed to the onboarding process
      const metadata = {
        profile_slug: urlSlug,
        profile_created_at: new Date().toISOString(),
        profile_needs_setup: true,
        profile_completed: false
      };

      console.log("Creating new user profile with needs_setup flag:", { 
        id, 
        email,
        fullName,
        metadata: JSON.stringify(metadata)
      });

      // Create a new user profile with default role (will be selected during onboarding)
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: id,
          email: email,
          full_name: fullName,
          avatar_url: image_url,
          is_active: true,
          role: 'student', // Default role until chosen in onboarding
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select();
      
      if (error) {
        console.error('Error creating user profile:', error);
        return new Response('Error creating user profile', { status: 500 });
      }

      console.log("✅ User profile created successfully:", {
        userId: id,
        profile: data
      });
      
      return NextResponse.json({ success: true, data });
    }
    
    else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data;
      
      // Get the email
      const email = email_addresses[0]?.email_address || '';
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();
      
      // Get existing profile to merge metadata
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('metadata, role')
        .eq('user_id', id)
        .single();
      
      // Update data for the profile
      const updateData: any = {
        email: email,
        full_name: fullName,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      };
      
      // Update role if it has changed in metadata
      if (unsafe_metadata?.role) {
        console.log(`Updating user role to: ${unsafe_metadata.role}`);
        updateData.role = unsafe_metadata.role;
      }
      
      // Update metadata if it exists from Clerk
      if (existingProfile?.metadata) {
        updateData.metadata = {
          ...existingProfile.metadata,
          // Update profile flags from metadata
          profile_completed: unsafe_metadata?.profile_completed ?? existingProfile.metadata.profile_completed,
          profile_needs_setup: unsafe_metadata?.profile_needs_setup ?? existingProfile.metadata.profile_needs_setup,
        };
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', id)
        .select();
      
      if (error) {
        console.error('Error updating user profile:', error);
        return new Response('Error updating user profile', { status: 500 });
      }

      console.log("✅ User profile updated successfully:", {
        userId: id,
        profile: data
      });
      
      return NextResponse.json({ success: true, data });
    }
    
    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      // Get Supabase admin client
      const supabase = await createAdminClient();
      
      // Mark user as inactive in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', id);
      
      if (error) {
        console.error('Error marking user as inactive:', error);
        return new Response('Error marking user as inactive', { status: 500 });
      }

      console.log("✅ User marked as inactive:", { userId: id });
      
      return NextResponse.json({ success: true });
    }
    
    // Return a 200 for all other event types
    return NextResponse.json({ success: true, message: `Webhook received: ${eventType}` });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 