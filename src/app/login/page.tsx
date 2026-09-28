import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = {
  title: 'Login — DevLaunch AI',
  description: 'Sign in to your DevLaunch AI dashboard to build resumes, portfolios, and more.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <AuthShell initialMode="login" />
    </Suspense>
  );
}
