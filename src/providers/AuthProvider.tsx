"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, isSupabaseConfigured, DEMO_SESSION_COOKIE } from "@/lib/env";
import type { AuthUser, UserTier } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoSession: (active: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${DEMO_SESSION_COOKIE}=`));
}

function writeDemoCookie(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    // 7 days
    document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const demoAllowed = isDemoMode();

  const loadProfile = useCallback(async (userId: string, email: string | null, metaName?: string) => {
    const supabase = createClient();
    let tier: UserTier = "free";
    let fullName: string | null = metaName ?? null;

    if (supabase) {
      const { data } = await supabase
        .from("profiles")
        .select("tier, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (data?.tier === "pro" || data?.tier === "free") tier = data.tier;
      if (data?.full_name) fullName = data.full_name;
    }

    setUser({
      id: userId,
      email,
      fullName,
      tier,
      isDemo: false,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!configured) {
      if (demoAllowed && readDemoCookie()) {
        setUser({
          id: "demo-user",
          email: "demo@devlaunch.local",
          fullName: "Demo User",
          tier: "pro",
          isDemo: true,
        });
      } else {
        setUser(null);
      }
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      return;
    }

    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
      await loadProfile(
        sessionUser.id,
        sessionUser.email ?? null,
        sessionUser.user_metadata?.full_name as string | undefined
      );
    } else {
      setUser(null);
    }
  }, [configured, demoAllowed, loadProfile]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!configured) {
          if (demoAllowed && readDemoCookie()) {
            if (mounted) {
              setUser({
                id: "demo-user",
                email: "demo@devlaunch.local",
                fullName: "Demo User",
                tier: "pro",
                isDemo: true,
              });
            }
          }
          return;
        }

        const supabase = createClient();
        if (!supabase) return;

        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();

        if (sessionUser && mounted) {
          await loadProfile(
            sessionUser.id,
            sessionUser.email ?? null,
            sessionUser.user_metadata?.full_name as string | undefined
          );
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if (session?.user) {
            await loadProfile(
              session.user.id,
              session.user.email ?? null,
              session.user.user_metadata?.full_name as string | undefined
            );
          } else if (event === "SIGNED_OUT") {
            setUser(null);
          }
          router.refresh();
        });

        return () => subscription.unsubscribe();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const cleanupPromise = init();
    return () => {
      mounted = false;
      void cleanupPromise.then((unsub) => unsub?.());
    };
  }, [configured, demoAllowed, loadProfile, router]);

  const setDemoSession = useCallback(
    (active: boolean) => {
      if (!demoAllowed) return;
      writeDemoCookie(active);
      if (active) {
        setUser({
          id: "demo-user",
          email: "demo@devlaunch.local",
          fullName: "Demo User",
          tier: "pro",
          isDemo: true,
        });
      } else {
        setUser(null);
      }
    },
    [demoAllowed]
  );

  const signOut = useCallback(async () => {
    if (user?.isDemo || !configured) {
      writeDemoCookie(false);
      setUser(null);
      router.push("/login");
      router.refresh();
      return;
    }

    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [configured, router, user?.isDemo]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemo: demoAllowed && !configured,
      signOut,
      refreshProfile,
      setDemoSession,
    }),
    [user, loading, demoAllowed, configured, signOut, refreshProfile, setDemoSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
