'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

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
  // Clerk publishable keys are base64 encoded and much longer than placeholders
  // Real keys look like: pk_test_Y2xr... (50+ chars with base64 content)
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

// Dynamically import ClerkProvider only when needed
const DynamicClerkProvider = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
);

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const isClient = useIsClient();

  // During SSR or if Clerk is not configured, just render children
  if (!isClient || !isClerkConfigured()) {
    return <>{children}</>;
  }

  return <DynamicClerkProvider>{children}</DynamicClerkProvider>;
}
