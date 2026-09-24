import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getAuthoritativeRole } from '@/lib/authorization';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isDummySupabase =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-project-id') ||
    supabaseAnonKey.includes('your-anon-key');

  const isDemoSession = request.cookies.get('devlaunch_demo_session')?.value === '1';

  if (isDummySupabase || isDemoSession) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    // Admin authorization uses the authoritative server-side role record only.
    // The client-controlled user_metadata.role is NEVER trusted here.
    if (pathname.startsWith('/dashboard/admin')) {
      const userRole = await getAuthoritativeRole(user.id, supabase);
      if (userRole !== 'admin') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};