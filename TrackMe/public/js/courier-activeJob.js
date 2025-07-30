import API_BASE_URL from './config.js';

// Formats date and time strings into "Mon D, YYYY at h:mm AM/PM"
function formatDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '—';
  const dt = new Date(`${dateStr}T${timeStr}`);
  const optsDate = { month: 'short', day: 'numeric', year: 'numeric' };
  const datePart = dt.toLocaleDateString('en-US', optsDate);
  const timePart = dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} at ${timePart}`;
}

// Fetches job details and updates the header and summary fields
async function initJobDetails() {
  const jobId = localStorage.getItem('currentJobId');
  if (!jobId) return console.warn('No currentJobId in storage');

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const job = await res.json();

    // Header
    document.getElementById('active-job-id').textContent = `Job #${job.jobId}`;

    // Summary values
    document.getElementById('active-destination').textContent =
      job.delivery?.address || '—';
    document.getElementById('active-delivery').textContent =
      formatDateTime(job.delivery?.date, job.delivery?.time);
  } catch (err) {
    console.error('Failed to load job details:', err);
  }
}

// Opens the "Confirm Status" popup with the given status label
function showPopup(statusText) {
  const popup = document.getElementById('status-popup');
  document.getElementById('new-status-text').textContent = statusText;
  popup.style.display = 'flex';
}

// Closes the status popup
function closePopup() {
  document.getElementById('status-popup').style.display = 'none';
}

// Converts UI label to API status value
function mapStatusToApi(statusText) {
  switch (statusText.toLowerCase()) {
    case 'waiting for pickup':               return 'waiting-for-pickup';
    case 'package picked up':                return 'package-picked-up';
    case 'in transit':                       return 'in-transit';
    case 'landed / on the way to delivery': return 'landed';
    case 'delivered':                        return 'delivered';
    default:                                 return 'waiting-for-pickup';
  }
}

// Converts API status back to the UI label
function mapApiToStatus(apiStatus) {
  switch (apiStatus) {
    case 'waiting-for-pickup': return 'Waiting for Pickup';
    case 'package-picked-up':  return 'Package Picked Up';
    case 'in-transit':         return 'In Transit';
    case 'landed':             return 'Landed / On the way to delivery';
    case 'delivered':          return 'Delivered';
    default:                   return '';
  }
}

// Lights up the correct steps in the progress bar
function updateStatusIcons(statusText) {
  const steps = [
    'waiting for pickup',
    'package picked up',
    'in transit',
    'landed / on the way to delivery',
    'delivered'
  ];
  const numLights = 4;
  const idx = steps.indexOf(statusText.toLowerCase());

  // Turn everything off if status is unknown
  if (idx === -1 || !statusText.trim()) {
    for (let i = 1; i <= numLights; i++) {
      document.getElementById(`step-${i}`)?.classList.remove('completed');
      if (i < numLights) document.getElementById(`line-${i}`)?.classList.remove('completed');
    }
    return;
  }

  const lightsToTurnOn = idx > 0 ? Math.min(idx, numLights) : 0;
  for (let i = 1; i <= numLights; i++) {
    document.getElementById(`step-${i}`)?.classList.toggle('completed', i <= lightsToTurnOn);
    if (i < numLights) {
      document.getElementById(`line-${i}`)?.classList.toggle('completed', i < lightsToTurnOn);
    }
  }
}

// Sends the new status to the backend and updates the UI
async function confirmStatus() {
  const newStatus = document.getElementById('new-status-text').textContent;
  closePopup();

  const jobId = localStorage.getItem('currentJobId');
  if (!jobId) {
    alert('Error: Missing job ID.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courierStatus: mapStatusToApi(newStatus) })
    });
    if (!res.ok) throw new Error('Failed to update status');

    document.getElementById('current-status').textContent = newStatus;
    updateStatusIcons(newStatus);
  } catch (err) {
    alert('Failed to update status: ' + err.message);
  }
}

// Fetches the current status from the backend to initialize the UI
async function initStatus() {
  const jobId = localStorage.getItem('currentJobId');
  if (!jobId) {
    updateStatusIcons(''); 
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job');
    const job = await res.json();

    const uiStatus = mapApiToStatus(job.courierStatus);
    document.getElementById('current-status').textContent = uiStatus;
    updateStatusIcons(uiStatus);
  } catch (err) {
    console.error('Failed to initialize status:', err);
    updateStatusIcons('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load dynamic details
  initJobDetails();
  initStatus();

  // Status popup buttons
  document.querySelector('.popup-confirm').addEventListener('click', confirmStatus);
  document.querySelector('.popup-cancel').addEventListener('click', closePopup);

  // Shortcut buttons to open popup
  document.querySelectorAll('.container12 button')
    .forEach(btn => btn.addEventListener('click', () => showPopup(btn.textContent)));

  // Back arrow
  document.getElementById('job-arrow')
    .addEventListener('click', () => window.location.href = 'courier-dashboard.html');
});

function getDeliveryIso(job) {
  // פורמט כפול—תאריך ושעה נפרדים
  if (job.delivery?.date && job.delivery?.time) {
    return `${job.delivery.date}T${job.delivery.time}`;
  }
  // שדות מאוחדים נפוצים
  return (
    job.delivery?.deliveryDateTime ||
    job.delivery?.deliveryAt       ||
    job.delivery?.dateTime         ||
    ''
  );
}

function formatIso(isoStr) {
  const dt = new Date(isoStr);
  if (isNaN(dt)) return '—';
  return dt.toLocaleString('en-US', {
    month : 'short',
    day   : 'numeric',
    year  : 'numeric',
    hour  : 'numeric',
    minute: '2-digit'
  });
}

const deliveryEl = document.getElementById('active-delivery');

if (job.delivery?.date && job.delivery?.time) {

  deliveryEl.textContent = formatDateTime(job.delivery.date, job.delivery.time);
} else if (job.delivery?.date) {

  deliveryEl.textContent = job.delivery.date;
} else if (job.delivery?.deliveryDateTime) {

  const dt = new Date(job.delivery.deliveryDateTime);
  deliveryEl.textContent = dt.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
} else {
  deliveryEl.textContent = '—';
}
