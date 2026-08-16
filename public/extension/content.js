// Content script executed on LinkedIn, Indeed, and Glassdoor job pages
(() => {
  function extractJobData() {
    let company = '';
    let title = '';
    let location = 'Remote';
    let url = window.location.href;

    const hostname = window.location.hostname;

    if (hostname.includes('linkedin.com')) {
      title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1')?.textContent?.trim() || '';
      company = document.querySelector('.job-details-jobs-unified-top-card__primary-description a, .jobs-unified-top-card__company-name')?.textContent?.trim() || '';
      location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.textContent?.trim() || 'Remote';
    } else if (hostname.includes('indeed.com')) {
      title = document.querySelector('h1.jobsearch-JobInfoHeader-title, .jobsearch-JobInfoHeader-title')?.textContent?.trim() || '';
      company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader')?.textContent?.trim() || '';
      location = document.querySelector('[data-testid="inlineHeader-companyLocation"]')?.textContent?.trim() || 'Remote';
    } else if (hostname.includes('glassdoor.com')) {
      title = document.querySelector('[data-test="jobTitle"], h1')?.textContent?.trim() || '';
      company = document.querySelector('[data-test="employerName"]')?.textContent?.trim() || '';
    }

    return {
      company: company || 'Target Company',
      title: title || 'Software Engineer',
      location: location || 'Remote',
      url: url,
      workplaceType: 'Remote',
      status: 'SAVED',
      appliedDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
      sendResponse(extractJobData());
    }
  });
})();
