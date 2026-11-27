import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Processed event IDs to prevent duplicate processing
const processedEvents = new Set<string>();

// Verify Paddle webhook signature
function verifyPaddleSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const [tsHeader, h1] = signature.split(';').map(pair => {
    const [key, value] = pair.split('=');
    return value;
  });

  const signedPayload = `${tsHeader}:${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(h1),
    Buffer.from(expectedSignature)
  );
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

    // 2. Duplicate event prevention
    if (processedEvents.has(eventId)) {
      console.log(`Event ${eventId} already processed`);
      return NextResponse.json({ received: true });
    }

    console.log('Paddle Webhook received:', eventType, eventId);

    // 3. Handle different event types
    if (eventType === 'transaction.completed') {
      const transaction = body.data;
      const customerId = transaction.customer_id;
      const customerEmail = transaction.customer?.email;
      const transactionId = transaction.id;
      const priceId = transaction.items?.[0]?.price?.id;

      if (!customerEmail || !priceId) {
        console.error('Missing required transaction data');
        return NextResponse.json(
          { error: 'Invalid transaction data' },
          { status: 400 }
        );
      }

      // Price ID to plan mapping
      const planMapping: { [key: string]: { plan: string; limit: number } } = {
        'pri_01m8e8kf7avdg06xcvncdta4yb': { plan: 'free', limit: 5 },
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

      // Find user by email
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (findError) {
        console.error('User lookup failed:', findError);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Update user plan with error handling
      const { error: updateError } = await supabase
        .from('users')
        .update({
          plan: planConfig.plan,
          message_limit: planConfig.limit,
          paddle_customer_id: customerId,
          paddle_transaction_id: transactionId,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        return NextResponse.json(
          { error: 'Database update failed' },
          { status: 500 }
        );
      }

      processedEvents.add(eventId);
      console.log(`User ${user.id} upgraded to ${planConfig.plan}`);
    }

    // Handle subscription events
    else if (eventType === 'subscription.canceled') {
      const subscription = body.data;
      const customerId = subscription.customer_id;

      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('paddle_customer_id', customerId);

      if (error) {
        console.error('Failed to cancel subscription:', error);
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500 }
        );
      }

      processedEvents.add(eventId);
      console.log(`Subscription canceled for ${customerId}`);
    }

    else if (eventType === 'subscription.updated') {
      const subscription = body.data;
      const customerId = subscription.customer_id;
      const newPriceId = subscription.items?.[0]?.price?.id;

      const planMapping: { [key: string]: { plan: string; limit: number } } = {
        'pri_01m8e8kf7avdg06xcvncdta4yb': { plan: 'free', limit: 5 },
        'pri_01m8eax50k2g8d2vehcgn1mj65': { plan: 'starter', limit: 1000 },
        'pri_01m8eazgazbyfte6yf01fqc0cm': { plan: 'growth', limit: 5000 },
        'pri_01m8eaycmq165jtnm6mjfem77s': { plan: 'agency', limit: 15000 }
      };

      const newPlan = planMapping[newPriceId];
      if (newPlan) {
        const { error } = await supabase
          .from('users')
          .update({
            plan: newPlan.plan,
            message_limit: newPlan.limit,
            updated_at: new Date().toISOString()
          })
          .eq('paddle_customer_id', customerId);

        if (error) {
          console.error('Failed to update plan:', error);
          return NextResponse.json(
            { error: 'Failed to update plan' },
            { status: 500 }
          );
        }

        processedEvents.add(eventId);
        console.log(`Plan updated to ${newPlan.plan} for ${customerId}`);
      }
    }

    else if (eventType === 'transaction.payment_failed') {
      const transaction = body.data;
      const customerId = transaction.customer_id;

      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'payment_failed',
          updated_at: new Date().toISOString()
        })
        .eq('paddle_customer_id', customerId);

      if (error) {
        console.error('Failed to mark payment failure:', error);
      }

      processedEvents.add(eventId);
      console.log(`Payment failed for ${customerId}`);
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
