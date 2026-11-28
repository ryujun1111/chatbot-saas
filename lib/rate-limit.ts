/**
 * Server-side Rate Limiting
 * Prevents abuse by tracking session and IP-based message counts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: Date;
  reason?: string;
}

/**
 * Check session-based rate limit
 * Limits messages per session to prevent page refresh abuse
 */
export async function checkSessionRateLimit(
  sessionId: string,
  limit: number = 50
): Promise<RateLimitResult> {
  try {
    // Get session message count from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('session_messages')
      .select('id')
      .eq('session_id', sessionId)
      .gte('created_at', oneDayAgo);

    if (error) {
      console.error('Error checking session rate limit:', error);
      // Fail open - allow the request if we can't check
      return { allowed: true, remaining: limit };
    }

    const count = data?.length || 0;
    const remaining = Math.max(0, limit - count);

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        reason: 'Session message limit exceeded. Please try again in 24 hours.'
      };
    }

    return {
      allowed: true,
      remaining
    };
  } catch (error) {
    console.error('Session rate limit check failed:', error);
    // Fail open
    return { allowed: true, remaining: limit };
  }
}

/**
 * Check IP-based rate limit
 * Prevents abuse from same IP address
 */
export async function checkIPRateLimit(
  ip: string,
  limit: number = 100
): Promise<RateLimitResult> {
  try {
    // Get IP message count from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('session_messages')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error checking IP rate limit:', error);
      return { allowed: true, remaining: limit };
    }

    const count = data?.length || 0;
    const remaining = Math.max(0, limit - count);

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60 * 60 * 1000),
        reason: 'Too many requests from this IP. Please try again in 1 hour.'
      };
    }

    return {
      allowed: true,
      remaining
    };
  } catch (error) {
    console.error('IP rate limit check failed:', error);
    return { allowed: true, remaining: limit };
  }
}

/**
 * Record a message for rate limiting
 */
export async function recordMessage(
  sessionId: string,
  chatbotId: string,
  ip?: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('session_messages')
      .insert([{
        session_id: sessionId,
        chatbot_id: chatbotId,
        ip_address: ip || 'unknown'
      }]);
  } catch (error) {
    console.error('Error recording message:', error);
    // Don't throw - this shouldn't block the message
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check common headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to 'unknown' - Vercel provides x-forwarded-for
  return 'unknown';
}
