// Show the status update confirmation popup
function showPopup(statusText) {
  const popup = document.getElementById('status-popup');
  document.getElementById('new-status-text').textContent = statusText;
  popup.style.display = 'flex';
}

// Close the status update confirmation popup
function closePopup() {
  document.getElementById('status-popup').style.display = 'none';
}

// Map UI status text to API status value (consistent with backend)
function mapStatusToApi(statusText) {
  switch (statusText.toLowerCase()) {
    case 'waiting for pickup':               return 'waiting-for-pickup';
    case 'package picked up':                return 'package-picked-up';
    case 'in transit':                       return 'in-transit';
    case 'landed / on the way to delivery': return 'landed';
    case 'delivered':                       return 'delivered';
    default:                               return 'waiting-for-pickup';
  }
}

// Map API status value to UI status text
function mapApiToStatus(apiStatus) {
  switch (apiStatus) {
    case 'waiting-for-pickup':
      return 'Waiting for Pickup';
    case 'package-picked-up':
      return 'Package Picked Up';
    case 'in-transit':
      return 'In Transit';
    case 'landed':
      return 'Landed / On the way to delivery';
    case 'delivered':
      return 'Delivered';
    default:
      return '';
  }
}

// Update the status step icons (lights) based on current status
function updateStatusIcons(statusText) {
  const steps = [
    'waiting for pickup',
    'package picked up',
    'in transit',
    'landed / on the way to delivery',
    'delivered'
  ];

  const numLights = 4; // Number of lights in the UI (step-1 to step-4)

  const idx = steps.indexOf(statusText.toLowerCase());

  // If unknown or empty status, turn off all lights and lines
  if (idx === -1 || statusText.trim() === '') {
    for (let i = 1; i <= numLights; i++) {
      document.getElementById(`step-${i}`)?.classList.remove('completed');
      if (i < numLights) {
        document.getElementById(`line-${i}`)?.classList.remove('completed');
      }
    }
    return;
  }

  // Map status to number of lights to turn on:
  // idx=0 => 0 lights (waiting for pickup)
  // idx=1 => 1 light (package picked up)
  // idx=2 => 2 lights (in transit)
  // idx=3 => 3 lights (landed)
  // idx=4 => 4 lights (delivered)

  const lightsToTurnOn = idx > 0 ? Math.min(idx, numLights) : 0;

  for (let i = 1; i <= numLights; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    const lineEl = document.getElementById(`line-${i}`);

    if (stepEl) stepEl.classList.toggle('completed', i <= lightsToTurnOn);
    if (lineEl) lineEl.classList.toggle('completed', i < lightsToTurnOn);
  }
}

// Confirm the new status and update backend
async function confirmStatus() {
  const newStatus = document.getElementById('new-status-text').textContent;
  closePopup();

  const jobId = localStorage.getItem('currentJobId');
  if (!jobId) {
    alert('Error: Missing job ID.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:5500/api/jobs/by-jobid/${jobId}`, {
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

// Initialize UI with current job status from server
async function initStatus() {
  const jobId = localStorage.getItem('currentJobId');
  if (!jobId) {
    updateStatusIcons(''); // turn off all lights if no job id
    return;
  }

  try {
    const res = await fetch(`http://localhost:5500/api/jobs/by-jobid/${jobId}`);
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
  initStatus();

  document.querySelector('.popup-confirm').addEventListener('click', confirmStatus);
  document.querySelector('.popup-cancel').addEventListener('click', closePopup);

  document.querySelectorAll('.container12 button').forEach(btn => {
    btn.addEventListener('click', () => showPopup(btn.textContent));
  });

  const arrow = document.getElementById('job-arrow');
  if (arrow) {
    arrow.style.cursor = 'pointer';
    arrow.addEventListener('click', () => window.location.href = 'courier-dashboard.html');
  }
});
