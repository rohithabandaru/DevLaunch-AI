"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { useAuth } from "@/providers/AuthProvider";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setDemoSession } = useAuth();

  const isDemo = isDemoMode() || !isSupabaseConfigured();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setDemoSession(true);
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 800);
      } else {
        const supabase = createClient();
        if (!supabase) {
          setError("Authentication is not configured.");
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.user) {
          // Best-effort profile row (trigger may also create it)
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: name,
            tier: "free",
          });

          if (data.session) {
            setSuccess("Account created! Redirecting to dashboard...");
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 800);
          } else {
            setSuccess(
              "Account created! Please check your email inbox for a verification link."
            );
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }
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
    <form onSubmit={handleRegister} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-700 border border-green-200">
          🎉 {success}
        </div>
      )}

      {isDemo && !success && (
        <div className="rounded-lg bg-amber-50 p-4 text-xs font-semibold text-amber-700 border border-amber-200">
          ⚡ Running in Demo Sandbox Mode. You will be signed in immediately.
        </div>
      )}

      <div>
        <label className="block font-semibold text-sm text-slate-700">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading || !!success}
          autoComplete="name"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block font-semibold text-sm text-slate-700">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!success}
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block font-semibold text-sm text-slate-700">Password</label>
        <input
          type="password"
          placeholder="Enter your password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || !!success}
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block font-semibold text-sm text-slate-700">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading || !!success}
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !!success}
        className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:shadow-indigo-200 disabled:opacity-70 font-semibold"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
