'use server';

import { auth } from '@clerk/nextjs/server';

export type UserRole = 'superAdmin' | 'admin' | 'user';

interface SessionClaims {
  metadata?: {
    role?: UserRole;
  };
}

/**
 * Check if the current user has a specific role
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  const { sessionClaims } = await auth() as { sessionClaims: SessionClaims | null };
  return sessionClaims?.metadata?.role === role;
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return checkRole('superAdmin');
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth() as { sessionClaims: SessionClaims | null };
  return sessionClaims?.metadata?.role || null;
}

/**
 * Require super admin role - throws if not authorized
 * Use in API routes and server actions
 */
export async function requireSuperAdmin(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth() as {
    userId: string | null;
    sessionClaims: SessionClaims | null
  };

  if (!userId) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const role = sessionClaims?.metadata?.role;
  if (role !== 'superAdmin') {
    throw new Error('Forbidden: Super admin access required');
  }

  return { userId };
}
