import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors if called from Server Components
        }
      },
    },
  });

  // Handle OAuth code exchange (Google login)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Handle email verification token (signup confirmation / password recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      // Email verified successfully — send to login so user can sign in
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(`${origin}/login?verified=true`);
      }
      // Password recovery — send to wherever 'next' points
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Verification failed
    return NextResponse.redirect(`${origin}/login?error=verification_failed`);
  }

  // No code or token — just redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
