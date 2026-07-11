import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Auth pages: signed-in users should be bounced away from these.
const isAuthRoute = createRouteMatcher(['/sign-in(.*)']);

// App pages that require a session. Extend this as protected routes are added
// (e.g. '/dashboard(.*)', '/settings(.*)').
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { isAuthenticated } = await auth();
  const { pathname } = req.nextUrl;

  if (isAuthenticated && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isAuthenticated && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
