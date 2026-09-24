import { redirect } from 'next/navigation';
import { createExtensionSessionToken, getSessionUser, EXTENSION_TOKEN_TTL_SECONDS } from '@/lib/auth-server';
import { ConnectClient } from './connect-client';

export const dynamic = 'force-dynamic';

export default async function ExtensionConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=/extension/connect`);
  }

  const token = await createExtensionSessionToken(user.id);
  if (!token) {
    redirect('/extension/connect?error=server');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B1020',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          padding: '32px',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {params.error === 'server' ? (
          <>
            <h1 style={{ marginTop: 0 }}>Connection failed</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              The extension bridge service is not configured on the server. Please try again later.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ marginTop: 0 }}>Connect DevLaunch AI extension</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              You are signed in as <strong style={{ color: '#e2e8f0' }}>{user.email}</strong>.
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>
              A temporary one-time connection code has been generated. Keep this tab open while the
              extension reads it (it will close automatically). The code expires in{' '}
              {Math.round(EXTENSION_TOKEN_TTL_SECONDS / 60)} minutes and can be used only once.
            </p>
            <div
              id="devlaunch-extension-token"
              data-devlaunch-token={token}
              style={{ display: 'none' }}
            />
            <ConnectClient />
          </>
        )}
      </div>
    </main>
  );
}