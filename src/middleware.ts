import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes accessible to all customers without login
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/r/(.*)',
  '/m/(.*)',
  '/api/reviews/(.*)',
  '/api/qr(.*)',
]);

export default clerkMiddleware((auth, request) => {
  // Allow public GET requests for single business or single menu by slug/ID
  // so customer review pages (/r/[slug]) and customer menu pages (/m/[slug]) work without login
  const isPublicGetApi =
    request.method === 'GET' &&
    (request.nextUrl.pathname.startsWith('/api/businesses/') ||
      request.nextUrl.pathname.startsWith('/api/menus/'));

  if (!isPublicRoute(request) && !isPublicGetApi) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
