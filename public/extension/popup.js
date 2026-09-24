// DevLaunch AI extension popup.
// Requires: config.js (generated with the deployed app origin), background.js.
//
// Authentication bridge:
//  1. The user clicks "Connect to DevLaunch AI".
//  2. A tab opens at <apiUrl>/extension/connect where the logged-in session's
//     server mints a short-lived, single-use token (exposed in the DOM).
//  3. This script injects a reader into that tab, stores the token in
//     chrome.storage.session, and closes the tab.
//  4. Save requests carry `Authorization: Bearer <token>` and are performed by
//     the background service worker (no CORS required).
//
// The extension never sees a user-provided id, never stores server secrets and
// never contains the Supabase service-role key or the OpenAI secret.

document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = (window.DEVLAUNCH_CONFIG && window.DEVLAUNCH_CONFIG.apiUrl) || '';
  const titleEl = document.getElementById('title');
  const companyEl = document.getElementById('company');
  const locationEl = document.getElementById('location');
  const saveBtn = document.getElementById('saveBtn');
  const connectBtn = document.getElementById('connectBtn');
  const statusMsg = document.getElementById('statusMsg');
  const authStatus = document.getElementById('authStatus');
  const TOKEN_TTL_MS = 10 * 60 * 1000;

  let currentJob = null;

  function setStatus(text, isError) {
    statusMsg.style.display = 'block';
    statusMsg.textContent = text;
    statusMsg.className = 'status' + (isError ? ' error' : '');
  }

  function clearStatus() {
    statusMsg.style.display = 'none';
    statusMsg.textContent = '';
    statusMsg.className = 'status';
  }

  async function loadAuthState() {
    const state = await chrome.storage.session.get(['devlaunchToken', 'devlaunchTokenExpiry']);
    if (
      state.devlaunchToken &&
      state.devlaunchTokenExpiry &&
      Date.now() < state.devlaunchTokenExpiry
    ) {
      authStatus.textContent = 'Connected — ready to save';
      connectBtn.style.display = 'none';
      saveBtn.disabled = false;
      return state.devlaunchToken;
    }
    authStatus.textContent = 'Not connected';
    connectBtn.style.display = 'block';
    saveBtn.disabled = true;
    return null;
  }

  async function storeToken(token) {
    await chrome.storage.session.set({
      devlaunchToken: token,
      devlaunchTokenExpiry: Date.now() + TOKEN_TTL_MS,
    });
  }

  async function connectFlow() {
    if (!apiUrl) {
      setStatus(
        'Extension is not configured for a DevLaunch AI server. Run `npm run extension:build` first.',
        true
      );
      return;
    }
    clearStatus();
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting…';

    try {
      const connectTab = await chrome.tabs.create({ url: `${apiUrl}/extension/connect` });

      const readToken = () => {
        const el = document.querySelector('#devlaunch-extension-token');
        if (el) {
          const token = el.getAttribute('data-devlaunch-token');
          if (token && token.length >= 32) return token;
        }
        return null;
      };

      let token = null;
      for (let attempt = 0; attempt < 20 && !token; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: connectTab.id },
            func: readToken,
          });
          token = results && results[0] && results[0].result;
        } catch {
          // Tab may still be loading; keep polling.
        }
      }

      if (!token) {
        setStatus('Connection code not found. Please try again.', true);
        await chrome.tabs.remove(connectTab.id).catch(() => {});
        return;
      }

      await storeToken(token);
      await chrome.tabs.remove(connectTab.id).catch(() => {});
      await loadAuthState();
      setStatus('Connected to DevLaunch AI.');
    } catch {
      setStatus('Connection failed. Please try again.', true);
    } finally {
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect to DevLaunch AI';
    }
  }

  connectBtn.addEventListener('click', connectFlow);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'extract' }, (response) => {
      if (response) {
        currentJob = response;
        titleEl.textContent = response.title || 'Software Engineer';
        companyEl.textContent = response.company || 'Target Company';
        locationEl.textContent = response.location || 'Remote';
      } else {
        const err = chrome.runtime.lastError;
        void err;
        titleEl.textContent = 'Job Posting Active Tab';
        companyEl.textContent = tabs[0].title || 'Current Web Page';
        locationEl.textContent = 'Remote';
        currentJob = {
          company: 'Target Company',
          title: tabs[0].title || 'Software Engineer',
          location: 'Remote',
          url: tabs[0].url,
          workplaceType: 'Remote',
        };
      }
    });
  });

  saveBtn.addEventListener('click', async () => {
    if (!currentJob) return;
    const token = await loadAuthState();
    if (!token) {
      setStatus('Connect to DevLaunch AI first.', true);
      return;
    }

    saveBtn.disabled = true;
    clearStatus();

    try {
      const payload = {
        company: currentJob.company,
        title: currentJob.title,
        location: currentJob.location || 'Remote',
        workplaceType: currentJob.workplaceType || 'Remote',
        url: currentJob.url || '',
        salary: currentJob.salary || '',
        description: currentJob.description || '',
      };

      const result = await chrome.runtime.sendMessage({
        type: 'devlaunch-clip',
        apiUrl,
        token,
        payload,
      });

      if (result && result.ok) {
        setStatus('Clipped & saved to DevLaunch AI Dashboard!');
        // Single-use token: drop it so it cannot be reused.
        await chrome.storage.session.remove(['devlaunchToken', 'devlaunchTokenExpiry']);
      } else if (result && result.status === 401) {
        setStatus('Session expired. Reconnect to DevLaunch AI.', true);
        await chrome.storage.session.remove(['devlaunchToken', 'devlaunchTokenExpiry']);
        await loadAuthState();
      } else {
        setStatus('API error saving job. Please try again.', true);
      }
    } catch {
      setStatus('Unable to reach DevLaunch AI. Check your connection.', true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  void loadAuthState();
});