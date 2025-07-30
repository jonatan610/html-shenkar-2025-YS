import API_BASE_URL from './config.js';
let itiInstances = {};

// ========== Helpers ==========
function normalizeJobId(id) {
  return id || null;
}

function showToast(message, type = 'blue') {
  const toast = document.createElement('section');
  toast.className = `popup-toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getJobIdFromURL() {
  return new URLSearchParams(window.location.search).get('id');
}

// ========== International Phone and Address Autocomplete ==========
function initIntlTelInputs() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    const iti = window.intlTelInput(input, {
      initialCountry: "il",
      preferredCountries: ["il", "us", "gb", "fr", "de"],
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js",
    });
    itiInstances[input.id] = iti; 
  });
}


// Autocomplete and syncing lat/lng for both addresses
function initGoogleAddressAutocomplete() {
  // Pickup
  const pickupInput = document.getElementById("pickupAddress");
  const pickupLat = document.getElementById("pickupLat");
  const pickupLng = document.getElementById("pickupLng");
  if (pickupInput && pickupLat && pickupLng && window.google) {
    const auto1 = new google.maps.places.Autocomplete(pickupInput, { types: ["geocode"] });
    auto1.addListener('place_changed', function () {
      const place = auto1.getPlace();
      if (place && place.geometry) {
        pickupLat.value = place.geometry.location.lat();
        pickupLng.value = place.geometry.location.lng();
      } else {
        pickupLat.value = "";
        pickupLng.value = "";
      }
    });
  }
  // Delivery
  const deliveryInput = document.getElementById("deliveryAddress");
  const deliveryLat = document.getElementById("deliveryLat");
  const deliveryLng = document.getElementById("deliveryLng");
  if (deliveryInput && deliveryLat && deliveryLng && window.google) {
    const auto2 = new google.maps.places.Autocomplete(deliveryInput, { types: ["geocode"] });
    auto2.addListener('place_changed', function () {
      const place = auto2.getPlace();
      if (place && place.geometry) {
        deliveryLat.value = place.geometry.location.lat();
        deliveryLng.value = place.geometry.location.lng();
      } else {
        deliveryLat.value = "";
        deliveryLng.value = "";
      }
    });
  }
}

// Helper for geocoding address -> lat/lng if needed
async function getLatLngFromAddress(address) {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        resolve({ lat: "", lng: "" });
      }
    });
  });
}

// ========== Job Details Population ==========
function populateJobDetails(job) {
  // Job ID & Status
  document.getElementById('job-id').textContent = job.jobId || job._id;
  const statusBtn = document.getElementById('statusToggle');
  document.getElementById('statusLabel').textContent = job.status || '—';
  statusBtn.className = 'status-select ' + (job.status || '');

  // Set dropdown to current status value
  if (statusBtn && statusBtn.tagName === 'SELECT') {
    statusBtn.value = job.status || '';
  }

  // Courier
  document.getElementById('courier-name').textContent = job.courier?.fullName || '—';

// Pickup
document.getElementById('pickupAddress').value = job.pickup?.address || '';
document.getElementById('pickupDate').value = job.pickup?.date || '';
document.getElementById('pickupTime').value = job.pickup?.time || '';
document.querySelector('.job-details--pickup .job-details__value').textContent = job.pickup?.contact || '—';


itiInstances['pickupPhone']?.setNumber(job.pickup?.phone || '');

if (document.getElementById('pickupLat')) 
  document.getElementById('pickupLat').value = job.pickup?.lat || "";
if (document.getElementById('pickupLng')) 
  document.getElementById('pickupLng').value = job.pickup?.lng || "";

  // Delivery
// Delivery
document.getElementById('deliveryAddress').value = job.delivery?.address || '';
document.getElementById('deliveryDate').value = job.delivery?.date || '';
document.getElementById('deliveryTime').value = job.delivery?.time || '';
document.querySelector('.job-details--delivery .job-details__value').textContent = job.delivery?.contact || '—';


itiInstances['deliveryPhone']?.setNumber(job.delivery?.phone || '');

if (document.getElementById('deliveryLat')) 
  document.getElementById('deliveryLat').value = job.delivery?.lat || "";
if (document.getElementById('deliveryLng')) 
  document.getElementById('deliveryLng').value = job.delivery?.lng || "";

  // Flight Outbound
  document.getElementById('flightOutDate').value = job.flight?.outbound?.date || '';
  document.getElementById('flightOutTime').value = job.flight?.outbound?.time || '';
  document.getElementById('flightOutCode').value = job.flight?.outbound?.code || '';

  // Flight Return
  document.getElementById('flightReturnDate').value = job.flight?.return?.date || '';
  document.getElementById('flightReturnTime').value = job.flight?.return?.time || '';
  document.getElementById('flightReturnCode').value = job.flight?.return?.code || '';

  // Courier Status
  document.getElementById('courierStatusText').textContent = job.courierStatus || '—';
  updateStatusIcons(job.courierStatus);

  // Phone input & Address autocomplete
  initIntlTelInputs();
  initGoogleAddressAutocomplete();
}

// ========== Edit Mode ==========
function enableEditing() {
  document.querySelectorAll('.job-details__value').forEach(span => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editable-field';
    input.value = span.textContent.trim();
    if (span.closest('.job-details--pickup')) input.id = 'pickupContact';
    if (span.closest('.job-details--delivery')) input.id = 'deliveryContact';
    span.replaceWith(input);
  });

  document.querySelectorAll('.editable-field').forEach(i => i.readOnly = false);

  // Hide Edit button when editing
  const editBtn = document.getElementById('editJobBtn');
  if (editBtn) editBtn.style.display = 'none';

  // Show Save button if missing
  if (!document.getElementById('saveJobBtn')) {
    const btn = document.createElement('section');
    btn.id = 'saveJobBtn';
    btn.className = 'action-button';
    btn.innerHTML = `<img src="assets/icons/save.svg" alt="Save"/><span>Save</span>`;
    document.querySelector('.job-header__actions').appendChild(btn);
    btn.addEventListener('click', () => {
      document.getElementById('popup-confirm-edit-save').classList.remove('hidden');
    });
  }
}

// ========== Save Edits (with lat/lng handling) ==========
async function saveJobEdits() {
  const jobId = normalizeJobId(getJobIdFromURL());
  if (!jobId) return showToast('Missing job ID', 'red');

  const pickupAddress = document.getElementById('pickupAddress').value;
  let pickupLat = document.getElementById('pickupLat')?.value || "";
  let pickupLng = document.getElementById('pickupLng')?.value || "";
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  let deliveryLat = document.getElementById('deliveryLat')?.value || "";
  let deliveryLng = document.getElementById('deliveryLng')?.value || "";

  if ((!pickupLat || !pickupLng) && pickupAddress) {
    const coords = await getLatLngFromAddress(pickupAddress);
    pickupLat = coords.lat; pickupLng = coords.lng;
  }
  if ((!deliveryLat || !deliveryLng) && deliveryAddress) {
    const coords = await getLatLngFromAddress(deliveryAddress);
    deliveryLat = coords.lat; deliveryLng = coords.lng;
  }

  const data = {
    pickup: {
      address: pickupAddress,
      date: document.getElementById('pickupDate').value,
      time: document.getElementById('pickupTime').value,
      contact: document.getElementById('pickupContact')?.value || '',
phone: itiInstances['pickupPhone']?.getNumber() || document.getElementById('pickupPhone').value,

      lat: pickupLat,
      lng: pickupLng
    },
    delivery: {
      address: deliveryAddress,
      date: document.getElementById('deliveryDate').value,
      time: document.getElementById('deliveryTime').value,
      contact: document.getElementById('deliveryContact')?.value || '',
  phone: itiInstances['deliveryPhone']?.getNumber() || document.getElementById('deliveryPhone').value,

      lat: deliveryLat,
      lng: deliveryLng
    },
    flight: {
      outbound: {
        date: document.getElementById('flightOutDate').value,
        time: document.getElementById('flightOutTime').value,
        code: document.getElementById('flightOutCode').value,
      },
      return: {
        date: document.getElementById('flightReturnDate').value,
        time: document.getElementById('flightReturnTime').value,
        code: document.getElementById('flightReturnCode').value,
      },
    }
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    showToast('Job updated', 'blue');
    setTimeout(() => location.reload(), 500);
  } catch {
    showToast('Failed to save', 'red');
  }
}

// ========== Status Icons ==========
function updateStatusIcons(statusText) {
  const steps = ['waiting-for-pickup', 'package-picked-up', 'in-transit', 'landed', 'delivered'];
  const idx = steps.indexOf((statusText || '').toLowerCase());
  const num = 4;
  for (let i = 1; i <= num; i++) {
    document.getElementById(`step-${i}`)?.classList.remove('completed');
    document.getElementById(`line-${i}`)?.classList.remove('completed');
  }
  if (idx > 0) {
    for (let i = 1; i <= Math.min(idx, num); i++) {
      document.getElementById(`step-${i}`)?.classList.add('completed');
      if (i < idx) document.getElementById(`line-${i}`)?.classList.add('completed');
    }
  }
}

// ========== Extra Actions ==========
async function deleteJob() {
  const jobId = normalizeJobId(getJobIdFromURL());
  if (!jobId) return showToast('Missing job ID', 'red');
  try {
   const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`, { method: 'DELETE' });

    showToast('Job deleted', 'blue');
 setTimeout(() => window.location.href = 'https://html-shenkar-2025-ys.onrender.com/admin-jobs.html', 1000);

  } catch {
    showToast('Failed to delete job', 'red');
  }
}

// ========== Unified Status Change (dropdown) ==========
function setupStatusToggle(jobId) {
  const select = document.getElementById("statusToggle");
  if (!select) return;
  select.addEventListener("change", async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: select.value })
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast("Status updated ✅", "blue");
      document.getElementById("statusLabel").textContent = select.value;
    } catch (err) {
      showToast("❌ " + err.message, "red");
    }
  });
}


// ========== Documents Upload ==========
function setupDocumentsUpload() {
  const uploadBtn = document.getElementById("uploadButton");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      document.getElementById("documentsModal").classList.remove("hidden");
    });
  }
  const closeBtn = document.getElementById("closeDocumentsModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("documentsModal").classList.add("hidden");
    });
  }
}

// ========== Wire Up Buttons ==========
function setupEventListeners() {
  document.getElementById('editJobBtn')?.addEventListener('click', enableEditing);

  document.querySelector('#popup-confirm-edit-save .popup-btn.confirm')
    ?.addEventListener('click', () => {
      document.getElementById('popup-confirm-edit-save').classList.add('hidden');
      saveJobEdits();
    });
  document.querySelector('#popup-confirm-edit-save .popup-btn.cancel')
    ?.addEventListener('click', () => document.getElementById('popup-confirm-edit-save').classList.add('hidden'));

  // Delete job confirm
  document.getElementById('deleteJobBtn')?.addEventListener('click', () => {
    document.getElementById('popup-confirm-delete').classList.remove('hidden');
  });
  document.querySelector('#popup-confirm-delete .popup-btn.confirm')
    ?.addEventListener('click', () => {
      document.getElementById('popup-confirm-delete').classList.add('hidden');
      deleteJob();
    });
  document.querySelector('#popup-confirm-delete .popup-btn.cancel')
    ?.addEventListener('click', () => document.getElementById('popup-confirm-delete').classList.add('hidden'));
}

// ========== Boot ==========
document.addEventListener('DOMContentLoaded', async () => {
  const jobId = normalizeJobId(getJobIdFromURL());
  if (!jobId) return showToast('Missing job ID', 'red');
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);

    if (!res.ok) throw new Error();
    const job = await res.json();
    populateJobDetails(job);
    setupEventListeners();
    setupStatusToggle(jobId);
    setupChatButton(jobId);
    setupDocumentsUpload();
  } catch (err) {
    console.error(err);
    showToast('Failed to load job', 'red');
  }
});




function openDocumentsPopup() {
  document.getElementById("documentsModal")?.classList.remove("hidden");
}
function closeDocumentsPopup() {
  document.getElementById("documentsModal")?.classList.add("hidden");
}
document.getElementById("uploadButton")?.addEventListener("click", openDocumentsPopup);
document.getElementById("closeDocumentsModal")?.addEventListener("click", closeDocumentsPopup);
const statusToggle = document.getElementById("statusToggle");
const statusOptions = document.getElementById("statusOptions");
statusToggle?.addEventListener("click", () => {
  statusOptions.style.display = statusOptions.style.display === "block" ? "none" : "block";
});
statusOptions?.querySelectorAll("li").forEach(li => {
  li.addEventListener("click", async () => {
    const newStatus = li.dataset.value;
    document.getElementById("statusLabel").textContent = li.textContent;
    statusOptions.style.display = "none";
    // שליחת העדכון לשרת:
    const jobId = document.getElementById('job-id').textContent; // או קח אותו מ-url/searchparams
await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}/status`, {

      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // (אפשר להציג toast להצלחה)
  });
});
document.addEventListener("click", function (e) {
  if (!statusToggle.contains(e.target) && !statusOptions.contains(e.target)) {
    statusOptions.style.display = "none";
  }
});

function setupChatButton(jobId) {
  // תואם ל‑HTML
  const chatBtn = document.getElementById('chatJobBtn');
  if (!chatBtn) return;            // הגנה

  chatBtn.addEventListener('click', () => {
    // ניווט לדף הצ׳אט של האדמין
    window.location.href = `admin-chat.html?id=${jobId}`;
  });
}

    // === Upload Popup logic ===
    const uploadPopup = document.querySelector(".upload-popup");
    const uploadButton = document.querySelector("#uploadButton");
    const closeBtn = document.querySelector(".upload-popup .close-btn");
    const cancelBtn = document.querySelector(".upload-popup .cancel-upload");
    const fileInput = document.querySelector(".upload-popup input[type='file']");
    const sendBtn = document.querySelector(".upload-popup .send-document");
    const uploadBox = document.querySelector(".upload-popup .upload-box");
    const messageInput = document.querySelector(".upload-popup textarea");

    // פתיחת הפופאפ
    uploadButton?.addEventListener("click", () => {
        uploadPopup.classList.remove("hidden");
    });

    // סגירה (X או Cancel)
    [closeBtn, cancelBtn].forEach(btn => {
        btn?.addEventListener("click", () => {
            uploadPopup.classList.add("hidden");
            fileInput.value = "";
            messageInput.value = "";
            uploadBox.querySelector("p").textContent = "Choose a file";
        });
    });

    // פתיחת file picker
    uploadBox?.addEventListener("click", () => fileInput.click());

    // הצגת שם הקובץ
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files[0];
        uploadBox.querySelector("p").textContent = file ? file.name : "Choose a file";
    });

    // שליחת הקובץ
    sendBtn?.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("document", file);
        formData.append("message", messageInput.value);

        try {
            const res = await fetch(`${API_BASE_URL}/api/uploads`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            showToast("✅ File uploaded successfully", "blue");
            console.log("Server response:", data);

            uploadPopup.classList.add("hidden");
            fileInput.value = "";
            messageInput.value = "";
            uploadBox.querySelector("p").textContent = "Choose a file";

        } catch (err) {
            showToast("❌ Upload error: " + err.message, "red");
            console.error(err);
        }
    });
