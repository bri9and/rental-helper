import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash is configured
function isUpstashConfigured() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// Create Redis client only if configured
const redis = isUpstashConfigured()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Different rate limiters for different endpoints
export const rateLimiters = {
  // General API: 100 requests per minute
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        prefix: 'rl:api',
      })
    : null,

  // Auth endpoints: 10 requests per minute (prevent brute force)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'rl:auth',
      })
    : null,

  // Sign up: 5 requests per minute (prevent spam)
  signup: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        prefix: 'rl:signup',
      })
    : null,

  // Strict: 20 requests per minute for sensitive operations
  strict: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'rl:strict',
      })
    : null,
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Check rate limit for a given identifier (usually IP)
 * Returns { success: true } if allowed, { success: false, reset } if blocked
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<{ success: boolean; reset?: number; remaining?: number }> {
  const limiter = rateLimiters[type];

  // If Upstash not configured, allow all requests
  if (!limiter) {
    return { success: true };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    reset: result.reset,
    remaining: result.remaining,
  };
}

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitEnabled(): boolean {
  return isUpstashConfigured();
}
