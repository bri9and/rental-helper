import { auth } from '@clerk/nextjs/server';

const DEV_USER_ID = 'dev_user_123';

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Clerk publishable keys are base64 encoded and much longer than placeholders
  // Real keys look like: pk_test_Y2xr... (50+ chars with base64 content)
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

/**
 * Get the current user ID, with fallback for development
 * Returns a mock user ID when Clerk is not configured
 */
export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkConfigured()) {
    // Return mock user for development
    return DEV_USER_ID;
  }

  const { userId } = await auth();
  return userId;
}

/**
 * Check if we're in dev mode without Clerk
 */
export function isDevMode(): boolean {
  return !isClerkConfigured();
}
