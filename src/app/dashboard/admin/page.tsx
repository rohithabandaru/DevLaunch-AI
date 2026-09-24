import { ShieldCheck } from 'lucide-react';
import { getSessionIdentity } from '@/lib/auth-server';
import { AdminPanel } from './admin-panel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const identity = await getSessionIdentity();

  // Authoritative, server-side check. The client-controlled metadata role is
  // never consulted; without a valid authenticated admin session this route
  // renders a 403 and proxy additionally redirects non-admins away.
  if (!identity || identity.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-red-500/20 p-4 text-red-400">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">403 — Access Denied</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          You do not have administrative privileges to access the admin control panel.
        </p>
      </div>
    );
  }

  return <AdminPanel />;
}