import { z } from "zod";

// Chatbot create schema (validated on the server)
export const createChatbotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a chatbot name")
    .max(50, "Name must be 50 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  website_url: z
    .string()
    .trim()
    .url("Please enter a valid website URL")
    .refine(
      (u) => /^https?:\/\//i.test(u),
      "URL must start with http:// or https://",
    )
    .optional()
    .or(z.literal("")),
  initial_message: z
    .string()
    .trim()
    .min(1, "Please enter a welcome message")
    .max(500, "Welcome message must be 500 characters or less")
    .default("Hi! How can I help you today?"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color (e.g. #3B82F6)")
    .default("#3B82F6"),
  model: z.enum(["gpt-4o-mini", "deepseek-chat"]).default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().min(100).max(2000).default(500),
});

// Update schema: every field optional, plus the active/inactive toggle.
// Defaults are stripped so a partial PATCH never resets other fields.
export const updateChatbotSchema = z.object({
  name: createChatbotSchema.shape.name.optional(),
  description: createChatbotSchema.shape.description,
  website_url: createChatbotSchema.shape.website_url,
  initial_message: z.string().trim().min(1).max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  model: z.enum(["gpt-4o-mini", "deepseek-chat"]).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(100).max(2000).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  website_url?: string;
  initial_message: string;
  color: string;
  model: "gpt-4o-mini" | "deepseek-chat";
  temperature: number;
  max_tokens: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export type CreateChatbotInput = z.infer<typeof createChatbotSchema>;
