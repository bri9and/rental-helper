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

function getSubdomain(host: string): string | null {
  // Handle localhost for development
  if (host.includes('localhost')) {
    return null;
  }

  // Extract subdomain from host (e.g., cleaner.rental-helper.com -> cleaner)
  const parts = host.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    // Only recognize specific subdomains
    if (['cleaner', 'admin'].includes(subdomain)) {
      return subdomain;
    }
  }
  return null;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const { pathname } = request.nextUrl;

  // Handle subdomain routing
  if (subdomain === 'cleaner') {
    // Rewrite cleaner.rental-helper.com/* to /cleaner/*
    if (!pathname.startsWith('/cleaner') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/cleaner${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  } else if (subdomain === 'admin') {
    // Rewrite admin.rental-helper.com/* to /admin/*
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

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
    '/cleaner(.*)',  // Cleaner routes are public (they use access codes)
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
