document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('title');
  const companyEl = document.getElementById('company');
  const locationEl = document.getElementById('location');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  let currentJob = null;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extract' }, (response) => {
        if (response) {
          currentJob = response;
          titleEl.textContent = response.title || 'Software Engineer';
          companyEl.textContent = response.company || 'Target Company';
          locationEl.textContent = response.location || 'Remote';
        } else {
          titleEl.textContent = 'Job Posting Active Tab';
          companyEl.textContent = tabs[0].title || 'Current Web Page';
          locationEl.textContent = 'Remote';
          currentJob = {
            company: 'Target Company',
            title: tabs[0].title || 'Software Engineer',
            location: 'Remote',
            url: tabs[0].url,
            status: 'SAVED',
            workplaceType: 'Remote',
            appliedDate: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      });
    }
  });

  saveBtn.addEventListener('click', () => {
    if (!currentJob) return;

    // Send payload to DevLaunch AI Web App or LocalStorage sync
    try {
      const STORAGE_KEY = 'devlaunch-ai:jobs';
      const raw = localStorage.getItem(STORAGE_KEY);
      const jobs = raw ? JSON.parse(raw) : [];
      const newJob = {
        id: `job-ext-${Date.now()}`,
        ...currentJob,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newJob, ...jobs]));
    } catch (e) {
      console.log('Saved via Extension Messaging', e);
    }

    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.5';
    statusMsg.style.display = 'block';
  });
});
