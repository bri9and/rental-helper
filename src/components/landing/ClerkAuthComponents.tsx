'use client';

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function ClerkHeaderAuth() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
          Sign In
        </Link>
        <Link href="/sign-up" className="h-9 sm:h-10 rounded-lg bg-sky-500 px-3 sm:px-4 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center">
          <span className="hidden sm:inline">Get Started</span>
          <span className="sm:hidden">Start</span>
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/admin/dashboard"
          className="h-9 sm:h-10 rounded-lg bg-sky-500 px-3 sm:px-4 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center"
        >
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">App</span>
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 sm:w-9 sm:h-9",
            }
          }}
        />
      </SignedIn>
    </>
  );
}

export function ClerkHeroAuth() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-up" className="h-12 rounded-lg bg-sky-500 px-6 text-base font-medium text-white hover:bg-sky-600 transition-colors flex items-center">
          Get Started Free
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/admin/dashboard"
          className="h-12 rounded-lg bg-sky-500 px-6 text-base font-medium text-white hover:bg-sky-600 transition-colors flex items-center"
        >
          Go to Dashboard
        </Link>
      </SignedIn>
    </>
  );
}
