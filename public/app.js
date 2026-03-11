const els = {
  healthBadge: document.getElementById('healthBadge'),
  boardUrl: document.getElementById('boardUrl'),
  scrapeBtn: document.getElementById('scrapeBtn'),
  scrapedCount: document.getElementById('scrapedCount'),
  savedCount: document.getElementById('savedCount'),
  scrapeError: document.getElementById('scrapeError'),

  refreshSavedBtn: document.getElementById('refreshSavedBtn'),
  savedError: document.getElementById('savedError'),
  jobsTbody: document.getElementById('jobsTbody'),
  jobSearch: document.getElementById('jobSearch'),

  jobDescription: document.getElementById('jobDescription'),
  userProfile: document.getElementById('userProfile'),
  useExampleProfileBtn: document.getElementById('useExampleProfileBtn'),
  generateBtn: document.getElementById('generateBtn'),
  resumeOutput: document.getElementById('resumeOutput'),
  resumeError: document.getElementById('resumeError'),
  copyResumeBtn: document.getElementById('copyResumeBtn'),
};

let cachedSavedJobs = [];

function setBadge(text, ok) {
  els.healthBadge.textContent = text;
  els.healthBadge.className =
    'rounded-full px-3 py-1 text-xs ' +
    (ok
      ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-900/50'
      : 'bg-rose-900/30 text-rose-200 border border-rose-900/50');
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

async function checkHealth() {
  try {
    const res = await fetch('/health');
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    setBadge('Online', true);
  } catch (e) {
    setBadge('Offline', false);
  }
}

async function scrapeAndStore() {
  hideError(els.scrapeError);
  els.scrapeBtn.disabled = true;
  els.scrapedCount.textContent = '…';

  try {
    const boardUrl = els.boardUrl.value.trim();
    if (!boardUrl) throw new Error('Please enter a Lever board URL.');

    const res = await fetch(`/api/jobs?boardUrl=${encodeURIComponent(boardUrl)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

    els.scrapedCount.textContent = String(data.jobs?.length ?? 0);
    await refreshSaved();
  } catch (e) {
    els.scrapedCount.textContent = '0';
    showError(els.scrapeError, e.message || String(e));
  } finally {
    els.scrapeBtn.disabled = false;
  }
}

function jobMatches(job, q) {
  if (!q) return true;
  const hay = `${job.title || ''} ${job.team || ''} ${job.location || ''}`.toLowerCase();
  return hay.includes(q);
}

function renderSavedJobs(jobs) {
  const q = els.jobSearch.value.trim().toLowerCase();
  const filtered = jobs.filter((j) => jobMatches(j, q));

  els.savedCount.textContent = String(jobs.length);
  els.jobsTbody.innerHTML = filtered
    .map((j) => {
      const safe = (v) => (v ? String(v) : '');
      return `
        <tr class="hover:bg-slate-900/40">
          <td class="px-4 py-3 font-medium text-slate-100">${safe(j.title)}</td>
          <td class="px-4 py-3 text-slate-300">${safe(j.team)}</td>
          <td class="px-4 py-3 text-slate-300">${safe(j.location)}</td>
          <td class="px-4 py-3 text-slate-300">${safe(j.source)}</td>
          <td class="px-4 py-3">
            ${
              j.url
                ? `<a class="text-indigo-300 hover:text-indigo-200 underline decoration-slate-700" target="_blank" rel="noreferrer" href="${j.url}">Open</a>`
                : ''
            }
          </td>
        </tr>
      `;
    })
    .join('');
}

async function refreshSaved() {
  hideError(els.savedError);
  els.refreshSavedBtn.disabled = true;

  try {
    const res = await fetch('/api/jobs/saved');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    cachedSavedJobs = Array.isArray(data.jobs) ? data.jobs : [];
    renderSavedJobs(cachedSavedJobs);
  } catch (e) {
    showError(els.savedError, e.message || String(e));
  } finally {
    els.refreshSavedBtn.disabled = false;
  }
}

function parseProfileJson() {
  const raw = els.userProfile.value.trim();
  if (!raw) throw new Error('Please paste a userProfile JSON.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('userProfile must be valid JSON.');
  }
}

async function generateResume() {
  hideError(els.resumeError);
  els.generateBtn.disabled = true;
  els.copyResumeBtn.disabled = true;
  els.resumeOutput.textContent = '';

  try {
    const jobDescription = els.jobDescription.value.trim();
    if (!jobDescription) throw new Error('Please paste a job description.');
    const userProfile = parseProfileJson();

    const res = await fetch('/api/resume/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription, userProfile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

    els.resumeOutput.textContent = data.resumeText || '';
    els.copyResumeBtn.disabled = !data.resumeText;
  } catch (e) {
    showError(els.resumeError, e.message || String(e));
  } finally {
    els.generateBtn.disabled = false;
  }
}

function useExampleProfile() {
  const example = {
    name: 'Jane Doe',
    yearsOfExperience: 5,
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Playwright'],
    projects: [
      {
        name: 'AI Job Agent',
        description: 'Scrapes Lever jobs, stores them in Postgres, and generates tailored resumes with Gemini.',
      },
    ],
  };
  els.userProfile.value = JSON.stringify(example, null, 2);
}

async function copyResume() {
  const text = els.resumeOutput.textContent || '';
  if (!text) return;
  await navigator.clipboard.writeText(text);
  els.copyResumeBtn.textContent = 'Copied';
  setTimeout(() => (els.copyResumeBtn.textContent = 'Copy'), 900);
}

els.scrapeBtn.addEventListener('click', scrapeAndStore);
els.refreshSavedBtn.addEventListener('click', refreshSaved);
els.jobSearch.addEventListener('input', () => renderSavedJobs(cachedSavedJobs));
els.useExampleProfileBtn.addEventListener('click', useExampleProfile);
els.generateBtn.addEventListener('click', generateResume);
els.copyResumeBtn.addEventListener('click', copyResume);

checkHealth();
refreshSaved();

