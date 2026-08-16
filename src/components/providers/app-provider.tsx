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

function toUser(authUser: SupabaseUser): User {
  const data = authUser.user_metadata;
  return {
    id: authUser.id,
    name: data.full_name || data.name || authUser.email?.split('@')[0] || 'DevLaunch user',
    email: authUser.email || '',
    bio: data.bio || '',
    photo: data.avatar_url || '',
    role: data.role === 'admin' ? 'admin' : 'user',
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => readStorage('theme', 'dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    writeStorage('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ? toUser(data.user) : null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toUser(session.user) : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    if (!supabase) return missingConfig;
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/login` } });
    if (error) return error.message;
    return data.session ? 'Account created successfully.' : 'Check your email to confirm your account.';
  }, []);
  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    if (!supabase) return missingConfig;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : 'Signed in successfully.';
  }, []);
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return missingConfig;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    return error ? error.message : 'Redirecting to Google...';
  }, []);
  const forgotPassword = useCallback(async (email: string) => {
    if (!supabase) return missingConfig;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    return error ? error.message : 'Password reset link sent. Check your inbox.';
  }, []);
  const logout = useCallback(() => { if (supabase) void supabase.auth.signOut(); }, []);
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!supabase || !user) return;
    const { id: _id, email: _email, role: _role, createdAt: _createdAt, ...metadata } = updates;
    void supabase.auth.updateUser({ data: metadata }).then(({ data }) => { if (data.user) setUser(toUser(data.user)); });
  }, [user]);
  const deleteAccount = useCallback(() => logout(), [logout]);
  const toggleAdminRole = useCallback(() => {}, []);

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
