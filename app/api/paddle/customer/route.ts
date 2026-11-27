import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, name } = await request.json();

    // Use authenticated user's email if not provided
    const customerEmail = email || user.email;
    const customerName = name || user.email?.split('@')[0];

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already has a Paddle customer ID
    const { data: existingUser } = await supabase
      .from('users')
      .select('paddle_customer_id')
      .eq('id', user.id)
      .single();

    if (existingUser?.paddle_customer_id) {
      return NextResponse.json({ 
        paddle_customer_id: existingUser.paddle_customer_id,
        already_exists: true
      });
    }

    // Determine Paddle API URL (Sandbox or Live)
    const paddleApiUrl = process.env.PADDLE_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox-api.paddle.com/customers'
      : 'https://api.paddle.com/customers';

    // Create Paddle customer
    const response = await fetch(paddleApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        name: customerName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Paddle customer creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create Paddle customer' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const customerId = data.data?.id;

    if (!customerId) {
      console.error('No customer ID in Paddle response:', data);
      return NextResponse.json(
        { error: 'Invalid Paddle response' },
        { status: 500 }
      );
    }

    // Save Paddle customer ID to database
    const { error: updateError } = await supabase
      .from('users')
      .update({ paddle_customer_id: customerId })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to save Paddle customer ID:', updateError);
      return NextResponse.json(
        { error: 'Failed to save customer ID' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      paddle_customer_id: customerId,
      created: true
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
