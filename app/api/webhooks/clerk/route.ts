import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // Verify webhook signature
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Webhook instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    // Verify the webhook
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Handle the webhook
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const userData = {
        id: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address ?? '',
        full_name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
        role: (evt.data.public_metadata.role as 'student' | 'teacher' | 'admin') || 'student',
        created_at: new Date(evt.data.created_at).toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update or create user profile in Supabase
      await supabaseAdmin
        .from('profiles')
        .upsert([userData]);
    }

    return new Response('Success', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }
} 