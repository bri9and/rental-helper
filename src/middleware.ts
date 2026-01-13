import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Clerk publishable keys are base64 encoded and much longer than placeholders
  // Real keys look like: pk_test_Y2xr... (50+ chars with base64 content)
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Skip Clerk middleware if not configured
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  // Dynamically import Clerk middleware only when configured
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

  const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ]);

  const middleware = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });

  return middleware(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
