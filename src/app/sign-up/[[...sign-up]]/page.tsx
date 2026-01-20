'use client';

import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rental Helper" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold text-zinc-900">Rental Helper</span>
          </Link>
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center p-4 bg-zinc-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Get started</h1>
            <p className="mt-2 text-zinc-600">Create your account</p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-white border border-zinc-200 shadow-lg',
                headerTitle: 'text-zinc-900',
                headerSubtitle: 'text-zinc-600',
                socialButtonsBlockButton: 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50',
                socialButtonsBlockButtonText: 'text-zinc-700 font-medium',
                dividerLine: 'bg-zinc-200',
                dividerText: 'text-zinc-500',
                formFieldLabel: 'text-zinc-700',
                formFieldInput: 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400',
                formButtonPrimary: 'bg-emerald-700 hover:bg-emerald-800',
                footerActionLink: 'text-emerald-700 hover:text-emerald-800',
                identityPreviewText: 'text-zinc-900',
                identityPreviewEditButton: 'text-emerald-700',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/admin/dashboard"
          />
        </div>
      </main>
    </div>
  );
}
