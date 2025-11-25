import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/groups(.*)',
  '/wallets(.*)',
  '/activity(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (!isProtectedRoute(req)) return;
  auth.protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
