"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDemoSession } = useAuth();

  const isDemo = isDemoMode() || !isSupabaseConfigured();
  const nextPath = searchParams.get("next") || "/dashboard";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setDemoSession(true);
        router.push(nextPath);
        router.refresh();
      } else {
        const supabase = createClient();
        if (!supabase) {
          setError("Authentication is not configured.");
          return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
        } else {
          router.push(nextPath);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {isDemo && (
        <div className="rounded-lg bg-amber-50 p-4 text-xs font-semibold text-amber-700 border border-amber-200">
          ⚡ Running in Demo Sandbox Mode. Any email/password will work.
        </div>
      )}

      <div>
        <label className="block font-semibold text-sm text-slate-700">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-sm text-slate-700">Password</label>
          <span className="text-sm font-semibold text-slate-400">Forgot Password?</span>
        </div>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:shadow-indigo-200 disabled:opacity-70 font-semibold"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
