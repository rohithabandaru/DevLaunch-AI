export interface GoogleUserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export function buildGoogleOAuthUrl(): string {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '130977196288-64veabln8pv4t5k83nc465fble5n7gdq.apps.googleusercontent.com';
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/jobs` : 'http://localhost:3000/dashboard/jobs';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
  
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=select_account`;
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Google User Profile:', err);
    return null;
  }
}

export async function fetchRealGmailMessages(accessToken: string): Promise<Array<{ id: string; sender: string; subject: string; date: string; body: string }>> {
  try {
    // Fetch recent messages directly from user's Gmail inbox
    const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listRes.ok) {
      const errBody = await listRes.text();
      console.error('Gmail API list returned status:', listRes.status, errBody);
      if (listRes.status === 403 || errBody.includes('disabled')) {
        throw new Error('GMAIL_API_DISABLED');
      }
      return [];
    }

    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    const messages: Array<{ id: string; sender: string; subject: string; date: string; body: string }> = [];

    // Fetch details for up to 100 messages
    for (const msgRef of listData.messages.slice(0, 100)) {
      try {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!msgRes.ok) continue;

        const msgData = await msgRes.json();
        interface GmailHeader { name: string; value: string }
        const headers: GmailHeader[] = msgData.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || 'Job Update';
        const sender = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'recruiter@company.com';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();
        const snippet = msgData.snippet || '';

        messages.push({
          id: msgRef.id,
          sender,
          subject,
          date,
          body: snippet,
        });
      } catch (e) {
        console.warn('Error fetching individual Gmail message:', e);
      }
    }

    return messages;
  } catch (err) {
    console.error('Failed to fetch real Gmail messages:', err);
    return [];
  }
}
