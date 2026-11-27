import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Paddle customer
    const response = await fetch('https://api.paddle.com/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || email.split('@')[0],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Paddle customer creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const customerId = data.data?.id;

    if (!customerId) {
      console.error('No customer ID in response:', data);
      return NextResponse.json(
        { error: 'Invalid Paddle response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      paddle_customer_id: customerId 
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
