import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <AuthShell />
    </Suspense>
  );
}
