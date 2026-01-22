import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';

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

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const { pathname } = request.nextUrl;

  // Handle subdomain routing
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

  // Skip Clerk middleware if not configured (development without Clerk)
  if (!isClerkConfigured()) {
    // In production, Clerk MUST be configured - block access to protected routes
    if (process.env.NODE_ENV === 'production') {
      // Allow only truly public routes without Clerk
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
    const reqPathname = req.nextUrl.pathname;

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
        // Redirect non-super-admins to home
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
