import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createChatbotSchema } from '@/lib/types/chatbot';

// GET: 챗봇 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 검색 파라미터
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // 쿼리 작성
    let query = supabase
      .from('chatbots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 검색 필터
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 상태 필터
    if (status && (status === 'active' || status === 'inactive')) {
      query = query.eq('status', status);
    }

    const { data: chatbots, error } = await query;

    if (error) {
      console.error('챗봇 조회 오류:', error);
      return NextResponse.json(
        { error: '챗봇을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ chatbots });
  } catch (error) {
    console.error('챗봇 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 챗봇 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검증
    const validationResult = createChatbotSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력 데이터가 올바르지 않습니다',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const chatbotData = validationResult.data;

    // 챗봇 생성
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .insert({
        user_id: user.id,
        name: chatbotData.name,
        description: chatbotData.description || null,
        website_url: chatbotData.website_url || null,
        initial_message: chatbotData.initial_message,
        color: chatbotData.color,
        model: chatbotData.model,
        temperature: chatbotData.temperature,
        max_tokens: chatbotData.max_tokens,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('챗봇 생성 오류:', error);
      return NextResponse.json(
        { error: '챗봇 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ chatbot }, { status: 201 });
  } catch (error) {
    console.error('챗봇 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
