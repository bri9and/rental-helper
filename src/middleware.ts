import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { checkRateLimit, isRateLimitEnabled, type RateLimitType } from '@/lib/rate-limit';

function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return key &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    key.length > 40 &&
    !key.includes('your_');
}

function getSubdomain(host: string): string | null {
  if (host.includes('localhost')) {
    return null;
  }

  const parts = host.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (['cleaner', 'admin'].includes(subdomain)) {
      return subdomain;
    }
  }
  return null;
}

function getClientIP(request: NextRequest): string {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

function getRateLimitType(pathname: string): RateLimitType | null {
  // Sign-up endpoints - strictest limit
  if (pathname.startsWith('/sign-up') || pathname.startsWith('/api/sign-up')) {
    return 'signup';
  }
  // Auth endpoints - strict limit
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/api/sign-in')) {
    return 'auth';
  }
  // Super-admin API - strict limit
  if (pathname.startsWith('/api/super-admin')) {
    return 'strict';
  }
  // All other API endpoints
  if (pathname.startsWith('/api/')) {
    return 'api';
  }
  // No rate limiting for pages
  return null;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const { pathname } = request.nextUrl;

  // Handle subdomain routing first
  if (subdomain === 'cleaner') {
    if (!pathname.startsWith('/cleaner') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/cleaner${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  } else if (subdomain === 'admin') {
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Rate limiting check (only in production and if Upstash is configured)
  if (process.env.NODE_ENV === 'production' && isRateLimitEnabled()) {
    const rateLimitType = getRateLimitType(pathname);

    if (rateLimitType) {
      const ip = getClientIP(request);
      const result = await checkRateLimit(rateLimitType, ip);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Please slow down and try again later',
            retryAfter: result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60),
              'X-RateLimit-Remaining': String(result.remaining || 0),
            },
          }
        );
      }
    }
  }

  // Skip Clerk middleware if not configured (development without Clerk)
  if (!isClerkConfigured()) {
    // In production, Clerk MUST be configured - block access to protected routes
    if (process.env.NODE_ENV === 'production') {
      const trulyPublicPaths = ['/', '/pricing', '/offline'];
      if (!trulyPublicPaths.includes(pathname) && !pathname.startsWith('/_next')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

  // Public routes - no authentication required
  const isPublicRoute = createRouteMatcher([
    '/',
    '/pricing',
    '/offline',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/cleaner(.*)',
    '/api/stripe/(.*)',
  ]);

  // Super-admin routes - require superAdmin role
  const isSuperAdminRoute = createRouteMatcher([
    '/super-admin(.*)',
    '/api/super-admin/(.*)',
  ]);

  // Dangerous routes that should be disabled in production
  const isDangerousRoute = createRouteMatcher([
    '/api/cleanup(.*)',
    '/api/debug/(.*)',
    '/api/seed-demo(.*)',
  ]);

  interface SessionClaims {
    metadata?: {
      role?: string;
    };
  }

  const middleware = clerkMiddleware(async (auth, req) => {
    // Block dangerous routes in production
    if (isDangerousRoute(req) && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    // Check super-admin routes
    if (isSuperAdminRoute(req)) {
      const { userId, sessionClaims } = await auth() as {
        userId: string | null;
        sessionClaims: SessionClaims | null;
      };

      // Must be authenticated
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Must have superAdmin role in metadata
      const userRole = sessionClaims?.metadata?.role;
      if (userRole !== 'superAdmin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protect all non-public routes (require authentication)
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });

  return middleware(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
