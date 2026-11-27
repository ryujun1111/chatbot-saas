import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paddleWebhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Plan limits mapping
const PLAN_LIMITS: Record<string, number> = {
  'pri_01jgy9kz3ap6q5k9d7bqkh4bej': 50,    // Free
  'pri_01jgy9nhg0x4yfk7cpbqp1xh30': 1000,  // Starter  
  'pri_01jgy9q0mhe4zcbbpq9jg0wj5t': 5000,  // Growth
  'pri_01jgy9rjw7ecw0dkfpf7x1qnrh': 15000  // Agency
};

function verifyPaddleSignature(rawBody: string, signature: string): boolean {
  if (!paddleWebhookSecret) return false;
  
  const hmac = crypto.createHmac('sha256', paddleWebhookSecret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('paddle-signature');
    const rawBody = await request.text();
    
    // Verify webhook signature
    if (!signature || !verifyPaddleSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const eventId = event.event_id;

    // Check if event already processed
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existing) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Store event
    await supabase
      .from('webhook_events')
      .insert([
        {
          event_id: eventId,
          event_type: eventType,
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]);

    // Handle different event types
    switch (eventType) {
      case 'transaction.completed': {
        const transaction = event.data;
        const customerId = transaction.customer_id;
        const priceId = transaction.items[0]?.price_id;
        const userId = transaction.custom_data?.user_id;

        if (!userId) {
          console.error('No user_id in transaction custom_data');
          break;
        }

        const messageLimit = PLAN_LIMITS[priceId] || 50;

        // Update user subscription
        await supabase
          .from('users')
          .update({
            paddle_customer_id: customerId,
            paddle_transaction_id: transaction.id,
            plan: getPlanName(priceId),
            message_limit: messageLimit,
            subscription_status: 'active',
            subscription_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        break;
      }

      case 'subscription.activated': {
        const subscription = event.data;
        const userId = subscription.custom_data?.user_id;
        const priceId = subscription.items[0]?.price?.id;

        if (!userId) break;

        const messageLimit = PLAN_LIMITS[priceId] || 50;

        await supabase
          .from('users')
          .update({
            paddle_customer_id: subscription.customer_id,
            plan: getPlanName(priceId),
            message_limit: messageLimit,
            subscription_status: 'active',
            subscription_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        break;
      }

      case 'subscription.canceled': {
        const subscription = event.data;
        const userId = subscription.custom_data?.user_id;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        break;
      }

      case 'subscription.paused': {
        const subscription = event.data;
        const userId = subscription.custom_data?.user_id;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            subscription_status: 'paused',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        break;
      }

      case 'subscription.resumed': {
        const subscription = event.data;
        const userId = subscription.custom_data?.user_id;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        break;
      }
    }

    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getPlanName(priceId: string): string {
  const planMap: Record<string, string> = {
    'pri_01jgy9kz3ap6q5k9d7bqkh4bej': 'free',
    'pri_01jgy9nhg0x4yfk7cpbqp1xh30': 'starter',
    'pri_01jgy9q0mhe4zcbbpq9jg0wj5t': 'growth',
    'pri_01jgy9rjw7ecw0dkfpf7x1qnrh': 'agency'
  };
  
  return planMap[priceId] || 'free';
}
