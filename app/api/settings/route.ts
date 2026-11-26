import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from database
    // For now, we'll return a placeholder response
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Mock response - in production, fetch from database
    const settings = {
      name: email.split('@')[0],
      email: email,
      currentPlan: 'free',
      usage: {
        chatbots: 0,
        messages: 0
      },
      apiKeys: []
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, currentPlan, apiKeys } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the database
    // For now, we'll just return success
    
    const updatedSettings = {
      name: name || email.split('@')[0],
      email,
      currentPlan: currentPlan || 'free',
      apiKeys: apiKeys || [],
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real app, this would delete from database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
