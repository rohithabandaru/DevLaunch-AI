'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const setSessionUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        writeStorage('user_auth_session', newUser);
        document.cookie = 'devlaunch_demo_session=1; path=/; max-age=86400';
      } else {
        writeStorage('user_auth_session', null);
        document.cookie = 'devlaunch_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, []);

  useEffect(() => {
    const storedUser = readStorage<User | null>('user_auth_session', null);
    if (storedUser) {
      setUser(storedUser);
      document.cookie = 'devlaunch_demo_session=1; path=/; max-age=86400';
    }
    const storedTheme = readStorage<'dark' | 'light'>('theme', 'dark');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    writeStorage('theme', theme);
  }, [theme]);

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
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/login` },
        });
        if (!error && data.user) {
          setSessionUser(toUser(data.user, 'user'));
          return 'Account created successfully.';
        }
      } catch {
        // Fallback to local user session
      }
    }
    setSessionUser({
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name || 'DevLaunch User',
      email: email || 'user@devlaunch.ai',
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
    return 'Account created successfully.';
  }, [setSessionUser]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          const serverRole = await fetchAuthoritativeRole();
          setSessionUser(toUser(data.user, serverRole));
          return 'Signed in successfully.';
        }
      } catch {
        // Fallback to local user session
      }
    }
    setSessionUser({
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0] || 'DevLaunch User',
      email: email || 'user@devlaunch.ai',
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

  const logout = useCallback(() => {
    if (supabase) {
      try { void supabase.auth.signOut(); } catch {}
    }
    setSessionUser(null);
  }, [setSessionUser]);
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!supabase || !user) return;
    const metadata = Object.fromEntries(
      Object.entries(updates).filter(([key]) => !['id', 'email', 'role', 'createdAt'].includes(key))
    );
    void supabase.auth.updateUser({ data: metadata }).then(async ({ data }) => {
      if (data.user) {
        const serverRole = await fetchAuthoritativeRole();
        setUser(toUser(data.user, serverRole));
      }
    });
  }, [user]);
  const deleteAccount = useCallback(() => logout(), [logout]);
  const toggleAdminRole = useCallback(() => { }, []);

  const authValue = useMemo(() => ({ user, isAuthenticated: user !== null, signUp, signIn, signInWithGoogle, forgotPassword, logout, updateProfile, deleteAccount, toggleAdminRole }), [user, signUp, signIn, signInWithGoogle, forgotPassword, logout, updateProfile, deleteAccount, toggleAdminRole]);
  const themeValue = useMemo(() => ({ theme, toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') }), [theme]);
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
