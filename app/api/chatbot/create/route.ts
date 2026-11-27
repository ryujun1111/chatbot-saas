import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { name, userId, websiteUrl } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    // Create chatbot in database
    const { data, error } = await supabase
      .from('chatbots')
      .insert([
        {
          user_id: userId,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Chatbot creation error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // If website URL provided, crawl it (simulate for now)
    if (websiteUrl) {
      // TODO: Implement web crawling
      console.log('Website URL to crawl:', websiteUrl);
    }

    return NextResponse.json({
      success: true,
      chatbot: data
    });

  } catch (error: any) {
    console.error('Chatbot creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
