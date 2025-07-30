/* admin-jobs.js – updated version */
/* Shows the first 4 cards, keeps the “See All Jobs” button fixed,
   reveals the rest on one click without hiding or changing the button */

import API_BASE_URL from './config.js';

const VISIBLE_COUNT = 4;          // number of cards shown by default
const MORE_JOBS_ID  = 'moreJobs'; // id for the hidden wrapper

document.addEventListener('DOMContentLoaded', () => {
  const seeAllBtn = document.getElementById('seeAllJobsBtn');

  /* One-time click → reveal hidden jobs; button stays but becomes inert */
  seeAllBtn?.addEventListener('click', () => {
    const hiddenSection = document.getElementById(MORE_JOBS_ID);
    if (!hiddenSection) return;

    hiddenSection.classList.remove('hidden'); // show the rest
    seeAllBtn.disabled = true;                // keep button, make it inert
    seeAllBtn.classList.add('is-disabled');   // optional dimming style
  });

  loadDynamicJobs(); // first render
});

async function loadDynamicJobs() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs = await res.json();

    const list = document.getElementById('dynamicJobsList');
    if (!list) return;
    list.innerHTML = '';

    /* Visible wrapper – grid of two columns */
    const firstWrap = document.createElement('section');
    firstWrap.className = 'jobs-list';              // <-- add grid class

    /* Hidden wrapper – same grid + hidden */
    const moreWrap  = document.createElement('section');
    moreWrap.id     = MORE_JOBS_ID;
    moreWrap.className = 'jobs-list hidden';        // <-- add grid class

    jobs.forEach((job, idx) => {
      const card = buildJobCard(job);
      (idx < VISIBLE_COUNT ? firstWrap : moreWrap).appendChild(card);
    });

    list.append(firstWrap, moreWrap);
  } catch (err) {
    console.error('Error loading jobs:', err);
  }
}

/* Builds a single job card (unchanged) */
function buildJobCard(job) {
  const jobId  = job.jobId || job._id?.slice(-5).toUpperCase();
  const date   = formatDate(job.delivery?.date);
  const dest   = extractCountry(job.delivery?.address);
  const status = (job.status || 'active').toLowerCase();

  const link = document.createElement('a');
  link.href  = `admin-viewJob.html?id=${job.jobId || job._id}`;
  link.className = 'job-link';

  link.innerHTML = `
    <article class="job-card">
      <header class="job-header">
        <span>Job ID</span><strong>${jobId}</strong>
      </header>
      <section class="job-info">
        <section class="job-detail">
          <img src="assets/icons/destination.svg" alt="" />
          <strong>Destination</strong><span>${dest}</span>
        </section>
        <section class="job-detail">
          <img src="assets/icons/delivery.svg" alt="" />
          <strong>Delivery</strong><span>${date}</span>
        </section>
        <section class="job-status ${status}">${capitalize(status)}</section>
      </section>
    </article>`;
  return link;
}

/* Helper functions */
function extractCountry(address = '') {
  if (!address) return 'Unknown';
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  return parts.at(-1) || 'Unknown';
}
function formatDate(d) {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return isNaN(dt) ? 'N/A' : dt.toLocaleDateString('en-GB');
}
function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
