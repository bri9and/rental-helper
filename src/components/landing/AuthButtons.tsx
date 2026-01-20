'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

// Subscribe function that does nothing (client state doesn't change from subscription)
const emptySubscribe = () => () => {};

// Returns true on client, false during SSR
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Must match the validation in ClerkProviderWrapper.tsx
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

// Fallback links when Clerk is not configured
function FallbackHeaderAuth() {
  return (
    <>
      <Link href="/sign-in" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
        Sign In
      </Link>
      <Link href="/sign-up" className="h-9 sm:h-10 rounded-lg bg-emerald-600 px-3 sm:px-4 text-sm font-medium text-white hover:bg-emerald-700 transition-colors flex items-center">
        <span className="hidden sm:inline">Get Started</span>
        <span className="sm:hidden">Start</span>
      </Link>
    </>
  );
}

function FallbackHeroAuth() {
  return (
    <Link href="/sign-up" className="h-12 rounded-lg bg-emerald-600 px-6 text-base font-medium text-white hover:bg-emerald-700 transition-colors flex items-center">
      Get Started Free
    </Link>
  );
}

// Dynamically import Clerk-powered components only when Clerk is configured
const ClerkHeaderAuth = dynamic(
  () => import('./ClerkAuthComponents').then((mod) => mod.ClerkHeaderAuth),
  { ssr: false, loading: () => <FallbackHeaderAuth /> }
);

const ClerkHeroAuth = dynamic(
  () => import('./ClerkAuthComponents').then((mod) => mod.ClerkHeroAuth),
  { ssr: false, loading: () => <FallbackHeroAuth /> }
);

export function HeaderAuthButtons() {
  const isClient = useIsClient();
  const clerkConfigured = isClerkConfigured();

  if (!isClient || !clerkConfigured) {
    return <FallbackHeaderAuth />;
  }

  return <ClerkHeaderAuth />;
}

export function HeroAuthButtons() {
  const isClient = useIsClient();
  const clerkConfigured = isClerkConfigured();

  if (!isClient || !clerkConfigured) {
    return <FallbackHeroAuth />;
  }

  return <ClerkHeroAuth />;
}
