import OpenAI from "openai";

// OpenAI: embeddings + default chat model (gpt-4o-mini)
export const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

// Optional: DeepSeek via OpenRouter, used only for chatbots that select model 'deepseek-chat'
const deepseekClient = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-chat";

// Split text into ~size-char chunks on sentence/word boundaries with a small overlap,
// so an answer that straddles a boundary is still retrievable.
export function splitTextIntoChunks(
  text: string,
  size = 1000,
  overlap = 150,
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const cut = Math.max(
        clean.lastIndexOf(". ", end),
        clean.lastIndexOf(" ", end),
      );
      if (cut > start + size / 2) end = cut + 1;
    }
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openaiClient.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function createChatCompletion(options: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { messages, model, temperature = 0.7, maxTokens = 500 } = options;

  if (model === "deepseek-chat" && deepseekClient) {
    try {
      const r = await deepseekClient.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      const text = r.choices[0]?.message?.content;
      if (text) return text;
    } catch (error) {
      // Keep the customer's chatbot answering even if OpenRouter is down / out of credit
      console.error(
        "DeepSeek (OpenRouter) failed, falling back to gpt-4o-mini:",
        error,
      );
    }
  }

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature,
    max_tokens: maxTokens,
  });
  return (
    response.choices[0]?.message?.content ||
    "Sorry, I couldn't generate an answer. Please try again."
  );
}
