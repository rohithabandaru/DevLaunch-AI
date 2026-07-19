import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  DEMO_SESSION_COOKIE,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isDemoMode,
  isSupabaseConfigured,
} from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/jobtracker",
  "/resume",
  "/portfolio",
  "/aiinterview",
  "/coding",
  "/questionbank",
  "/reports",
];

const AUTH_PAGES = ["/login", "/register"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow webhooks without auth
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  const hasDemoSession = isDemoMode() && !!demoCookie;

  let hasSupabaseSession = false;

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(
      getSupabaseUrl()!,
      getSupabaseAnonKey()!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh session if needed
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSupabaseSession = !!user;
  }

  const isAuthed = hasSupabaseSession || hasDemoSession;

  // Protect app pages (API routes enforce their own auth)
  if (isProtectedPath(pathname) && !isAuthed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage(pathname) && isAuthed) {
    const dash = request.nextUrl.clone();
    dash.pathname = "/dashboard";
    dash.search = "";
    return NextResponse.redirect(dash);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except:
     * - _next/static, _next/image
     * - favicon and common static assets
     * - api/webhooks (handled early above, still matched but allowed)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
