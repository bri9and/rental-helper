'use client';

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { useSyncExternalStore } from 'react';

// Version from package.json - imported at build time
const APP_VERSION = "1.4011";

// Check if Clerk is configured
const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

interface SiteHeaderProps {
  showPricing?: boolean;
  showDashboard?: boolean;
  variant?: 'default' | 'minimal';
}

export function SiteHeader({ showPricing = true, showDashboard = true, variant = 'default' }: SiteHeaderProps) {
  const isClient = useIsClient();
  const clerkConfigured = isClerkConfigured();

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo - anchored left */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Rental Helper"
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10"
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
            Rental Helper
          </span>
        </Link>

        {/* Navigation - right */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {showPricing && (
            <Link
              href="/pricing"
              className="hidden sm:block text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Pricing
            </Link>
          )}

          {isClient && clerkConfigured ? (
            <>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="h-9 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center"
                >
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                {showDashboard && (
                  <Link
                    href="/admin/dashboard"
                    className="h-9 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="relative">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 ring-2 ring-transparent hover:ring-emerald-200 transition-all duration-200",
                        userButtonPopoverCard: "shadow-lg border border-zinc-200 rounded-xl",
                        userButtonPopoverActions: "p-2",
                        userButtonPopoverActionButton: "rounded-lg hover:bg-zinc-100 transition-colors",
                        userButtonPopoverFooter: "hidden",
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="h-9 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
    {/* Version number - fixed position */}
    <div className="fixed bottom-2 right-2 text-[10px] text-zinc-400 z-50">
      v{APP_VERSION}
    </div>
    </>
  );
}
