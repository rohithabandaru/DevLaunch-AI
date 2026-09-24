import { Sidebar } from '@/components/layout/sidebar';
import { SubscriptionGate } from '@/components/subscription/subscription-gate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_40%)] text-slate-100 print:bg-none print:text-black">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 print:p-0 print:overflow-visible print:w-full">
        <SubscriptionGate>
          {children}
        </SubscriptionGate>
      </main>
    </div>
  );
}

