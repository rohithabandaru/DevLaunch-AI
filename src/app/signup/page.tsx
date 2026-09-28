import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = {
  title: 'Sign Up — DevLaunch AI',
  description: 'Create a free DevLaunch AI account to build ATS-optimized resumes, portfolios, and cover letters.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <AuthShell initialMode="signup" />
    </Suspense>
  );
}
