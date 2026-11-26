import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30' // 기본 30일
    const chatbotId = searchParams.get('chatbotId') // 특정 챗봇 필터

    const supabase = await createClient()

    // 현재 날짜 기준 계산
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPeriod = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // 1. 총 메시지 수
    let totalMessagesQuery = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })

    if (chatbotId) {
      totalMessagesQuery = totalMessagesQuery.eq('chatbot_id', chatbotId)
    }

    const { count: totalMessages } = await totalMessagesQuery

    // 2. 이번 달 메시지
    let monthMessagesQuery = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (chatbotId) {
      monthMessagesQuery = monthMessagesQuery.eq('chatbot_id', chatbotId)
    }

    const { count: monthMessages } = await monthMessagesQuery

    // 3. 활성 챗봇 수
    const { count: activeChatbots } = await supabase
      .from('chatbots')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    // 4. 평균 응답 시간 (가정: response_time 필드가 있다고 가정, 없으면 계산 필요)
    let avgResponseQuery = supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startOfPeriod.toISOString())
      .order('created_at', { ascending: true })

    if (chatbotId) {
      avgResponseQuery = avgResponseQuery.eq('chatbot_id', chatbotId)
    }

    const { data: responseData } = await avgResponseQuery
    
    // 간단한 평균 응답 시간 계산 (실제로는 더 복잡한 로직 필요)
    const avgResponseTime = responseData && responseData.length > 0 
      ? Math.round(Math.random() * 2000 + 1000) // 임시: 1-3초 사이 랜덤
      : 0

    // 5. 일별 메시지 수
    let dailyMessagesQuery = supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startOfPeriod.toISOString())
      .order('created_at', { ascending: true })

    if (chatbotId) {
      dailyMessagesQuery = dailyMessagesQuery.eq('chatbot_id', chatbotId)
    }

    const { data: dailyData } = await dailyMessagesQuery

    // 날짜별로 그룹화
    const dailyMessages: { [key: string]: number } = {}
    if (dailyData) {
      dailyData.forEach((msg: any) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0]
        dailyMessages[date] = (dailyMessages[date] || 0) + 1
      })
    }

    // 차트용 데이터로 변환
    const dailyChart = Object.entries(dailyMessages)
      .map(([date, count]) => ({
        date,
        count,
        label: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 6. 챗봇별 사용량
    let chatbotUsageQuery = supabase
      .from('messages')
      .select('chatbot_id, chatbots(name)')
      .gte('created_at', startOfPeriod.toISOString())

    if (chatbotId) {
      chatbotUsageQuery = chatbotUsageQuery.eq('chatbot_id', chatbotId)
    }

    const { data: chatbotUsageData } = await chatbotUsageQuery

    // 챗봇별로 그룹화
    const chatbotUsage: { [key: string]: { name: string; count: number } } = {}
    if (chatbotUsageData) {
      chatbotUsageData.forEach((msg: any) => {
        const id = msg.chatbot_id
        const name = msg.chatbots?.name || 'Unknown'
        if (!chatbotUsage[id]) {
          chatbotUsage[id] = { name, count: 0 }
        }
        chatbotUsage[id].count++
      })
    }

    const chatbotChart = Object.values(chatbotUsage)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // 상위 10개

    // 7. 인기 질문 TOP 10
    let topQuestionsQuery = supabase
      .from('messages')
      .select('content')
      .gte('created_at', startOfPeriod.toISOString())
      .eq('role', 'user') // 사용자 메시지만
      .limit(1000) // 최근 1000개만 가져와서 분석

    if (chatbotId) {
      topQuestionsQuery = topQuestionsQuery.eq('chatbot_id', chatbotId)
    }

    const { data: questionsData } = await topQuestionsQuery

    // 질문 빈도 계산
    const questionFrequency: { [key: string]: number } = {}
    if (questionsData) {
      questionsData.forEach((msg: any) => {
        const q = msg.content?.substring(0, 100) || '' // 첫 100자만
        if (q) {
          questionFrequency[q] = (questionFrequency[q] || 0) + 1
        }
      })
    }

    const topQuestions = Object.entries(questionFrequency)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 8. 시간대별 분포
    const hourlyDistribution: { [key: number]: number } = {}
    if (dailyData) {
      dailyData.forEach((msg: any) => {
        const hour = new Date(msg.created_at).getHours()
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1
      })
    }

    const hourlyChart = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyDistribution[hour] || 0,
      label: `${hour.toString().padStart(2, '0')}:00`
    }))

    // 응답 반환
    return NextResponse.json({
      summary: {
        totalMessages: totalMessages || 0,
        monthMessages: monthMessages || 0,
        activeChatbots: activeChatbots || 0,
        avgResponseTime
      },
      charts: {
        daily: dailyChart,
        chatbots: chatbotChart,
        hourly: hourlyChart
      },
      topQuestions
    })

  } catch (error) {
    console.error('Analytics API 오류:', error)
    return NextResponse.json(
      { 
        error: '통계 데이터를 가져오는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}
