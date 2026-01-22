import { auth } from '@clerk/nextjs/server';

const DEV_USER_ID = 'dev_user_123';

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

/**
 * Get the current user ID
 *
 * SECURITY: In production, Clerk MUST be configured.
 * Dev mode fallback only works in development environment.
 */
export async function getAuthUserId(): Promise<string | null> {
  // In production, always require Clerk authentication
  if (process.env.NODE_ENV === 'production') {
    if (!isClerkConfigured()) {
      console.error('CRITICAL: Clerk is not configured in production!');
      return null; // Never return a mock user in production
    }
    const { userId } = await auth();
    return userId;
  }

  // Development mode: allow mock user only if Clerk not configured
  if (!isClerkConfigured()) {
    console.warn('DEV MODE: Using mock user ID. Configure Clerk for real authentication.');
    return DEV_USER_ID;
  }

  const { userId } = await auth();
  return userId;
}

/**
 * Check if we're in dev mode without Clerk
 * Only returns true in development environment
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production' && !isClerkConfigured();
}
