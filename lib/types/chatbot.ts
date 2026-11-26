import { z } from 'zod';

// Chatbot 생성 스키마
export const createChatbotSchema = z.object({
  name: z.string()
    .min(1, '챗봇 이름을 입력해주세요')
    .max(50, '챗봇 이름은 50자를 넘을 수 없습니다'),
  description: z.string()
    .max(500, '설명은 500자를 넘을 수 없습니다')
    .optional(),
  website_url: z.string()
    .url('올바른 웹사이트 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
  initial_message: z.string()
    .min(1, '초기 메시지를 입력해주세요')
    .max(500, '초기 메시지는 500자를 넘을 수 없습니다')
    .default('안녕하세요! 무엇을 도와드릴까요?'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요')
    .default('#3B82F6'),
  model: z.enum(['gpt-4o-mini', 'deepseek-chat'])
    .default('deepseek-chat'),
  temperature: z.number()
    .min(0)
    .max(2)
    .default(0.7),
  max_tokens: z.number()
    .min(100)
    .max(4000)
    .default(1000),
});

// Chatbot 업데이트 스키마 (모든 필드 선택적)
export const updateChatbotSchema = createChatbotSchema.partial();

// Chatbot 타입
export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  website_url?: string;
  initial_message: string;
  color: string;
  model: 'gpt-4o-mini' | 'deepseek-chat';
  temperature: number;
  max_tokens: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Chatbot 생성 요청 타입
export type CreateChatbotInput = z.infer<typeof createChatbotSchema>;

// Chatbot 업데이트 요청 타입
export type UpdateChatbotInput = z.infer<typeof updateChatbotSchema>;

// Chatbot 통계 타입
export interface ChatbotStats {
  chatbot_id: string;
  total_conversations: number;
  total_messages: number;
  avg_response_time: number;
  satisfaction_rate: number;
}
