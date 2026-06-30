import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth');
  const isRootRoute = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  
  // Allow root route to redirect without auth check
  if (isRootRoute) {
    return response;
  }
  
  // Protect admin routes (except admin login)
  if (isAdminRoute && !isAdminLoginRoute && !user) {
    const redirectUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated admin users from admin login to admin dashboard
  if (isAdminLoginRoute && user) {
    const redirectUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Don't protect main site routes - they use their own auth
  // Only protect admin routes

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
