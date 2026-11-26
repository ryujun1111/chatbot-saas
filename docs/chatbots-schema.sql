-- 챗봇 테이블 생성
CREATE TABLE IF NOT EXISTS chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  website_url TEXT,
  initial_message VARCHAR(500) NOT NULL DEFAULT '안녕하세요! 무엇을 도와드릴까요?',
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  model VARCHAR(50) NOT NULL DEFAULT 'deepseek-chat' CHECK (model IN ('gpt-4o-mini', 'deepseek-chat')),
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER NOT NULL DEFAULT 1000 CHECK (max_tokens >= 100 AND max_tokens <= 4000),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX idx_chatbots_status ON chatbots(status);
CREATE INDEX idx_chatbots_created_at ON chatbots(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 챗봇만 조회 가능
CREATE POLICY "Users can view own chatbots"
  ON chatbots FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 챗봇만 생성 가능
CREATE POLICY "Users can create own chatbots"
  ON chatbots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 챗봇만 수정 가능
CREATE POLICY "Users can update own chatbots"
  ON chatbots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 챗봇만 삭제 가능
CREATE POLICY "Users can delete own chatbots"
  ON chatbots FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON chatbots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 챗봇 통계를 위한 뷰 (선택사항)
CREATE OR REPLACE VIEW chatbot_stats AS
SELECT 
  c.id as chatbot_id,
  c.name,
  c.user_id,
  COUNT(DISTINCT conv.id) as total_conversations,
  COUNT(msg.id) as total_messages,
  AVG(EXTRACT(EPOCH FROM (msg.created_at - LAG(msg.created_at) OVER (PARTITION BY conv.id ORDER BY msg.created_at)))) as avg_response_time,
  COALESCE(AVG(CASE WHEN fb.rating IS NOT NULL THEN fb.rating ELSE NULL END), 0) as satisfaction_rate
FROM chatbots c
LEFT JOIN conversations conv ON c.id = conv.chatbot_id
LEFT JOIN messages msg ON conv.id = msg.conversation_id
LEFT JOIN feedback fb ON conv.id = fb.conversation_id
GROUP BY c.id, c.name, c.user_id;

COMMENT ON TABLE chatbots IS '챗봇 기본 정보 및 설정';
COMMENT ON COLUMN chatbots.id IS '챗봇 고유 ID';
COMMENT ON COLUMN chatbots.user_id IS '챗봇 소유자 ID';
COMMENT ON COLUMN chatbots.name IS '챗봇 이름';
COMMENT ON COLUMN chatbots.description IS '챗봇 설명';
COMMENT ON COLUMN chatbots.website_url IS '챗봇이 사용될 웹사이트 URL';
COMMENT ON COLUMN chatbots.initial_message IS '챗봇 초기 인사 메시지';
COMMENT ON COLUMN chatbots.color IS '챗봇 UI 테마 색상 (HEX)';
COMMENT ON COLUMN chatbots.model IS '사용할 AI 모델';
COMMENT ON COLUMN chatbots.temperature IS 'AI 응답 창의성 (0-2)';
COMMENT ON COLUMN chatbots.max_tokens IS '최대 토큰 수 (응답 길이)';
COMMENT ON COLUMN chatbots.status IS '챗봇 활성화 상태';
COMMENT ON COLUMN chatbots.created_at IS '생성 일시';
COMMENT ON COLUMN chatbots.updated_at IS '최종 수정 일시';
