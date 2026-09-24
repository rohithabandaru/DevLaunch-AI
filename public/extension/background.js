// DevLaunch AI extension background service worker.
// Performs the authenticated API call. Because the manifest grants
// host_permissions for the DevLaunch app origin, these requests do not require
// cross-origin CORS configuration.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'devlaunch-clip') {
    const { apiUrl, token, payload } = message;
    fetch(`${apiUrl}/api/extension/clip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        sendResponse({ ok: res.ok, status: res.status, body: text });
      })
      .catch((err) => {
        sendResponse({ ok: false, status: 0, error: String(err) });
      });
    return true; // keep message channel open for async response
  }
  return false;
});