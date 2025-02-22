import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up'
]);

export default clerkMiddleware((auth, req) => {
  if (publicRoutes(req)) {
    return NextResponse.next();
  }
  return auth.protect().then(() => NextResponse.next());
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
