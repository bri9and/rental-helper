'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function ClerkHeaderAuth() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            Get Started
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <a
          href="/admin/dashboard"
          className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 flex items-center"
        >
          Dashboard
        </a>
        <UserButton />
      </SignedIn>
    </>
  );
}

export function ClerkHeroAuth() {
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal">
          <button className="h-12 rounded-lg bg-emerald-700 px-6 text-base font-medium text-white hover:bg-emerald-800">
            Start Free Trial
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <a
          href="/admin/dashboard"
          className="h-12 rounded-lg bg-emerald-700 px-6 text-base font-medium text-white hover:bg-emerald-800 flex items-center"
        >
          Go to Dashboard
        </a>
      </SignedIn>
    </>
  );
}
