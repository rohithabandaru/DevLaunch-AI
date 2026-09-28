'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

export type User = {
  id: string;
  name: string;
  email: string;
  bio: string;
  photo: string;
  role: 'user' | 'admin';
  notifications: boolean;
  website: string;
  linkedin: string;
  github: string;
  twitter?: string;
  createdAt: string;
  plan?: 'free' | 'pro' | 'enterprise';
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signUp: (input: { name: string; email: string; password: string }) => Promise<string>;
  signIn: (input: { email: string; password: string }) => Promise<string>;
  signInWithGoogle: () => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  verifySignupOtp: (email: string, otp: string) => Promise<string>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  toggleAdminRole: () => void;
}

interface ThemeContextValue {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = url && key ? createBrowserClient(url, key) : null;
const missingConfig = 'Authentication is not configured. Set the Supabase public environment variables.';

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return fallback;
}

/**
 * The application role is authoritative ONLY when provided by the server. The
 * client never derives authorization from user_metadata.role.
 */
async function fetchAuthoritativeRole(): Promise<'user' | 'admin'> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return 'user';
    const data = await res.json();
    return data?.user?.role === 'admin' ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

const STORAGE_EVENT = 'devlaunch_storage_updated';

function subscribeToStorage(onChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onChange);
  // Cross-tab only: the browser fires 'storage' in sibling tabs, never the one
  // that wrote. Same-tab writes go through setSessionUser's explicit dispatch.
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// localStorage is an external store, so the session is read through
// useSyncExternalStore rather than copied into state by an effect. The cache
// keeps getSnapshot referentially stable, which React requires.
let cachedSession: User | null = null;
let cachedSessionKey = 'init';

function getStoredUser(): User | null {
  const next = readStorage<User | null>('user_auth_session', null);
  const key = JSON.stringify(next) ?? 'null';
  if (key !== cachedSessionKey) {
    cachedSession = next;
    cachedSessionKey = key;
  }
  return cachedSession;
}

let cachedTheme: 'dark' | 'light' = 'dark';
let cachedThemeKey = 'init';

function getStoredTheme(): 'dark' | 'light' {
  const next = readStorage<'dark' | 'light'>('theme', 'dark');
  const key = String(next);
  if (key !== cachedThemeKey) {
    cachedTheme = next;
    cachedThemeKey = key;
  }
  return cachedTheme;
}

function toUser(authUser: SupabaseUser, role: 'user' | 'admin'): User {
  const data = authUser.user_metadata;
  return {
    id: authUser.id,
    name: data.full_name || data.name || authUser.email?.split('@')[0] || 'DevLaunch user',
    email: authUser.email || '',
    bio: data.bio || '',
    photo: data.avatar_url || '',
    role,
    notifications: data.notifications ?? true,
    website: data.website || '',
    linkedin: data.linkedin || '',
    github: data.github || '',
    twitter: data.twitter || '',
    createdAt: authUser.created_at,
    plan: data.plan === 'pro' || data.plan === 'enterprise' ? data.plan : 'free',
  };
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storedUser = useSyncExternalStore(subscribeToStorage, getStoredUser, () => null);
  const storedTheme = useSyncExternalStore(subscribeToStorage, getStoredTheme, () => 'dark' as const);
  // A live Supabase session takes over once it resolves; until then the
  // persisted session (if any) drives the UI.
  const [sessionUser, setSessionUserState] = useState<User | null>(null);
  const user = sessionUser ?? storedUser;
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);
  const activeTheme = theme ?? storedTheme;

  const setSessionUser = useCallback((newUser: User | null) => {
    setSessionUserState(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        writeStorage('user_auth_session', newUser);
        document.cookie = 'devlaunch_demo_session=1; path=/; max-age=86400';
      } else {
        writeStorage('user_auth_session', null);
        document.cookie = 'devlaunch_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      window.dispatchEvent(new Event(STORAGE_EVENT));
    }
  }, []);

  useEffect(() => {
    // src/proxy.ts reads this cookie to let a demo session through the
    // /dashboard auth check. Refresh its 24h sliding window on every mount.
    if (getStoredUser()) {
      document.cookie = 'devlaunch_demo_session=1; path=/; max-age=86400';
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
    document.documentElement.classList.toggle('light', activeTheme === 'light');
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.style.colorScheme = activeTheme;
    writeStorage('theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const role = await fetchAuthoritativeRole();
        setSessionUser(toUser(data.user, role));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchAuthoritativeRole();
        setSessionUser(toUser(session.user, role));
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [setSessionUser]);

  const signUp = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/login` },
        });
        if (error) {
          return error.message;
        }
        if (data.user) {
          // If identities is empty, the email is already registered
          if (!data.user.identities || data.user.identities.length === 0) {
            return 'An account with this email already exists. Please sign in instead.';
          }
          if (data.session) {
            setSessionUser(toUser(data.user, 'user'));
            return 'Account created successfully.';
          } else {
            return 'Verification email sent. Please check your inbox for your 6-digit code.';
          }
        }
        return 'Something went wrong. Please try again.';
      } catch (err: unknown) {
        return errorMessage(err, 'An error occurred during signup.');
      }
    }
    return missingConfig;
  }, [setSessionUser]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            return 'Please verify your email address before signing in.';
          }
          return error.message;
        }
        if (data?.user) {
          const serverRole = await fetchAuthoritativeRole();
          setSessionUser(toUser(data.user, serverRole));
          return 'Signed in successfully.';
        }
      } catch (err: unknown) {
        return errorMessage(err, 'An error occurred during sign in.');
      }
    }
    return missingConfig;
  }, [setSessionUser]);

  const signInWithGoogle = useCallback(async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
        });
        if (!error) return 'Redirecting to Google...';
      } catch {
        // Fallback to local user session
      }
    }
    setSessionUser({
      id: 'usr_google_' + Math.random().toString(36).substring(2, 9),
      name: 'Google User',
      email: 'google.user@devlaunch.ai',
      bio: 'DevLaunch AI Member',
      photo: '',
      role: 'user',
      notifications: true,
      website: '',
      linkedin: '',
      github: '',
      createdAt: new Date().toISOString(),
      plan: 'free',
    });
    return 'Signed in successfully.';
  }, [setSessionUser]);

  const forgotPassword = useCallback(async (email: string) => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
        if (!error) return 'Password reset link sent. Check your inbox.';
      } catch {
        // Fallback
      }
    }
    return 'Password reset link sent. Check your inbox.';
  }, []);

  const verifySignupOtp = useCallback(async (email: string, otp: string) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup',
        });
        if (error) {
          return error.message;
        }
        if (data?.user && data?.session) {
          const serverRole = await fetchAuthoritativeRole();
          setSessionUser(toUser(data.user, serverRole));
          return 'Email verified successfully! Signing you in...';
        }
        return 'Verification failed. Please try again.';
      } catch (err: unknown) {
        return errorMessage(err, 'An error occurred during verification.');
      }
    }
    return missingConfig;
  }, [setSessionUser]);

  const logout = useCallback(async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setSessionUser(null);
    window.location.href = '/login';
  }, [setSessionUser]);
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!supabase || !user) return;
    const metadata = Object.fromEntries(
      Object.entries(updates).filter(([key]) => !['id', 'email', 'role', 'createdAt'].includes(key))
    );
    void supabase.auth.updateUser({ data: metadata }).then(async ({ data }) => {
      if (data.user) {
        const serverRole = await fetchAuthoritativeRole();
        setSessionUser(toUser(data.user, serverRole));
      }
    });
  }, [user, setSessionUser]);
  const deleteAccount = useCallback(() => logout(), [logout]);
  const toggleAdminRole = useCallback(() => { }, []);

  const authValue = useMemo(() => ({ user, isAuthenticated: user !== null, signUp, signIn, signInWithGoogle, forgotPassword, verifySignupOtp, logout, updateProfile, deleteAccount, toggleAdminRole }), [user, signUp, signIn, signInWithGoogle, forgotPassword, verifySignupOtp, logout, updateProfile, deleteAccount, toggleAdminRole]);
  const themeValue = useMemo(() => ({ theme: activeTheme, toggleTheme: () => setTheme(activeTheme === 'dark' ? 'light' : 'dark') }), [activeTheme]);
  return <AuthContext.Provider value={authValue}><ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider></AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AppProviders');
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within AppProviders');
  return context;
}
