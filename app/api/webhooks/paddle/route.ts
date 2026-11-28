import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyPaddleSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  try {
    const parts = signature.split(';');
    if (parts.length !== 2) return false;

    const [tsPart, h1Part] = parts;
    const ts = tsPart.split('=')[1];
    const h1 = h1Part.split('=')[1];

    if (!ts || !h1) return false;

    // Timestamp validation (5-minute window)
    const timestampMs = parseInt(ts) * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(now - timestampMs) > fiveMinutes) {
      console.error('Webhook timestamp too old or in future');
      return false;
    }

    const signedPayload = `${ts}:${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(h1),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    // 1. Signature verification
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (!verifyPaddleSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event_type;
    const eventId = body.event_id;

    // 2. Duplicate prevention (atomic)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
      console.log(`Event ${eventId} already processed`);
      return NextResponse.json({ received: true });
    }

    console.log('Paddle Webhook received:', eventType, eventId);

    // 3. Handle transaction.completed
    if (eventType === 'transaction.completed') {
      const transaction = body.data;
      const customerId = transaction.customer_id;
      const subscriptionId = transaction.subscription_id;
      const priceId = transaction.items?.[0]?.price?.id;

      if (!customerId || !priceId) {
        console.error('Missing required transaction data');
        return NextResponse.json(
          { error: 'Invalid transaction data' },
          { status: 400 }
        );
      }

      // Find user by paddle_customer_id
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('paddle_customer_id', customerId)
        .single();

      if (findError || !user) {
        console.error('User not found for customer_id:', customerId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Price mapping
      const planMapping: { [key: string]: { plan: string; limit: number } } = {
        'pri_01m8e8kf7avdg06xcvncdta4yb': { plan: 'free', limit: 50 },
        'pri_01m8eax50k2g8d2vehcgn1mj65': { plan: 'starter', limit: 1000 },
        'pri_01m8eazgazbyfte6yf01fqc0cm': { plan: 'growth', limit: 5000 },
        'pri_01m8eaycmq165jtnm6mjfem77s': { plan: 'agency', limit: 15000 }
      };

      const planConfig = planMapping[priceId];
      if (!planConfig) {
        console.error('Unknown price ID:', priceId);
        return NextResponse.json(
          { error: 'Unknown price ID' },
          { status: 400 }
        );
      }

      // Use atomic RPC function
      const { data: result, error: rpcError } = await supabase.rpc(
        'process_subscription_event',
        {
          p_user_id: user.id,
          p_event_id: eventId,
          p_event_type: eventType,
          p_subscription_id: subscriptionId || '',
          p_plan: planConfig.plan,
          p_message_limit: planConfig.limit,
          p_status: 'active'
        }
      );

      if (rpcError) {
        console.error('RPC failed:', rpcError);
        return NextResponse.json(
          { error: 'Failed to process subscription' },
          { status: 500 }
        );
      }

      console.log('Subscription processed:', result);
    }

    // 4. Handle subscription.canceled
    else if (eventType === 'subscription.canceled') {
      const subscription = body.data;
      const customerId = subscription.customer_id;
      const subscriptionId = subscription.id;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('paddle_customer_id', customerId)
        .single();

      if (!user) {
        console.error('User not found:', customerId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { data: result, error: rpcError } = await supabase.rpc(
        'process_subscription_event',
        {
          p_user_id: user.id,
          p_event_id: eventId,
          p_event_type: eventType,
          p_subscription_id: subscriptionId,
          p_plan: 'free',
          p_message_limit: 50,
          p_status: 'canceled'
        }
      );

      if (rpcError) {
        console.error('RPC failed:', rpcError);
        return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
      }

      console.log('Subscription canceled:', result);
    }

    // 5. Handle subscription.updated
    else if (eventType === 'subscription.updated') {
      const subscription = body.data;
      const customerId = subscription.customer_id;
      const subscriptionId = subscription.id;
      const newPriceId = subscription.items?.[0]?.price?.id;

      const planMapping: { [key: string]: { plan: string; limit: number } } = {
        'pri_01m8e8kf7avdg06xcvncdta4yb': { plan: 'free', limit: 50 },
        'pri_01m8eax50k2g8d2vehcgn1mj65': { plan: 'starter', limit: 1000 },
        'pri_01m8eazgazbyfte6yf01fqc0cm': { plan: 'growth', limit: 5000 },
        'pri_01m8eaycmq165jtnm6mjfem77s': { plan: 'agency', limit: 15000 }
      };

      const newPlan = planMapping[newPriceId];
      if (newPlan) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('paddle_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: result, error: rpcError } = await supabase.rpc(
          'process_subscription_event',
          {
            p_user_id: user.id,
            p_event_id: eventId,
            p_event_type: eventType,
            p_subscription_id: subscriptionId,
            p_plan: newPlan.plan,
            p_message_limit: newPlan.limit,
            p_status: subscription.status || 'active'
          }
        );

        if (rpcError) {
          console.error('RPC failed:', rpcError);
          return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }

        console.log('Subscription updated:', result);
      }
    }

    // 6. Handle payment failure
    else if (eventType === 'transaction.payment_failed') {
      const transaction = body.data;
      const customerId = transaction.customer_id;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('paddle_customer_id', customerId)
        .single();

      if (!user) {
        console.error('User not found:', customerId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { data: result, error: rpcError } = await supabase.rpc(
        'process_subscription_event',
        {
          p_user_id: user.id,
          p_event_id: eventId,
          p_event_type: eventType,
          p_subscription_id: '',
          p_plan: 'free',
          p_message_limit: 50,
          p_status: 'payment_failed'
        }
      );

      if (rpcError) {
        console.error('RPC failed:', rpcError);
      }

      console.log('Payment failed:', result);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
