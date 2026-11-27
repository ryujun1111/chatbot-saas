import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    console.log('Paddle Webhook received:', eventType);

    // 결제 성공 이벤트
    if (eventType === 'transaction.completed') {
      const customerId = body.data.customer_id;
      const customerEmail = body.data.customer.email;
      const priceId = body.data.items[0]?.price_id;

      // Price ID로 플랜 결정
      const planMapping: { [key: string]: string } = {
        'pri_01m8e8kf7avdg06xcvncdta4yb': 'free',
        'pri_01m8eax50k2g8d2vehcgn1mj65': 'starter',
        'pri_01m8eazgazbyfte6yf01fqc0cm': 'growth',
        'pri_01m8eaycmq165jtnm6mjfem77s': 'agency'
      };

      const plan = planMapping[priceId] || 'free';

      // Supabase에서 사용자 찾기 (이메일로)
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (user) {
        // 사용자 플랜 업데이트
        await supabase
          .from('users')
          .update({
            plan: plan,
            paddle_customer_id: customerId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        console.log(`Updated user ${user.id} to ${plan} plan`);
      } else {
        console.log(`User not found: ${customerEmail}`);
      }
    }

    // 구독 취소 이벤트
    if (eventType === 'subscription.canceled') {
      const customerId = body.data.customer_id;

      await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('paddle_customer_id', customerId);

      console.log(`Subscription canceled for customer ${customerId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
