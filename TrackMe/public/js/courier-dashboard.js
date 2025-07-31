import API_BASE_URL from './config.js';

const currentJobId = localStorage.getItem("currentJobId") || null;
let mapInitialized = false;
let currentJob = null;  

// Toggle burger menu
function toggleMenu() {
  const menu = document.getElementById("burger-popup");
  menu.classList.toggle("hidden");
}

// Close burger menu
function closeBurgerMenu() {
  const menu = document.getElementById("burger-popup");
  menu.classList.add("hidden");
}

// Chat popup
function openChatPopup() {
  document.getElementById("chat-popup").classList.remove("hidden");
}
function closeChatPopup() {
  document.getElementById("chat-popup").classList.add("hidden");
}
function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (message) {
    alert("Message sent: " + message);
    input.value = "";
  }
}

// Delivery popup
function openDeliveryPopup() {
  const popup = document.getElementById("delivery-popup");
  if (!popup || !currentJob) return;

  popup.classList.remove("hidden");

  const isBeforePickup = currentJob.courierStatus === "waiting-for-pickup";
  const locationData = isBeforePickup ? currentJob.pickup : currentJob.delivery;

  const titleEl = document.getElementById("delivery-popup-title");
  const addressEl = document.getElementById("delivery-address");
  const navigateLink = document.getElementById("navigate-link");
  const navigateText = document.getElementById("navigate-text");

  const locationType = isBeforePickup ? "Pickup" : "Delivery";
  titleEl.textContent = `${locationType} Location`;
  addressEl.textContent = locationData?.address || "—";
  document.getElementById("copy-address-btn")?.setAttribute("data-address", locationData?.address || "");

  if (locationData?.lat && locationData?.lng) {
    navigateLink.href = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
  } else {
    navigateLink.href = "#";
  }
  navigateText.textContent = `Navigate to ${locationType}`;

  // Initialize map with small delay
  if (locationData?.lat && locationData?.lng) {
    setTimeout(() => {
      initMap(locationData.lat, locationData.lng);
    }, 250);
  }
}

// Google Maps initialization
function initMap(lat, lng) {
  if (!window.google || !google.maps) {
    console.error("Google Maps library not loaded yet!");
    return;
  }

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: parseFloat(lat), lng: parseFloat(lng) },
    zoom: 14
  });

  new google.maps.Marker({
    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
    map,
    title: "Job Location"
  });
}

function closeDeliveryPopup() {
  document.getElementById("delivery-popup").classList.add("hidden");
}

// Copy address to clipboard
function copyAddress() {
  const address = document.getElementById("copy-address-btn")?.getAttribute("data-address") || "";
  if (!address) return alert("No address to copy");

  navigator.clipboard.writeText(address)
    .then(() => alert("Address copied to clipboard!"))
    .catch(() => alert("Failed to copy address."));
}

// Call popup
function closeCallPopup() {
  document.getElementById("call-popup").classList.add("hidden");
}
function callNumber() {
  const number = document.getElementById("popup-phone").textContent;
  window.location.href = `tel:${number}`;
}
function openCallPopup(title, phone) {
  document.getElementById("call-popup").classList.remove("hidden");
  document.getElementById("popup-title").textContent = title || "";
  document.getElementById("popup-phone").textContent = phone || "";
  document.getElementById("popup-button-text").textContent = phone ? `Call ${title}` : "No number available";
}

// Open full chat page
function openFullChat() {
  const jobId = localStorage.getItem("currentJobId");
  if (!jobId) {
    alert("No job selected for chat.");
    return;
  }
  window.location.href = `courier-chat.html?id=${jobId}`;
}

// Map courier status to UI string
function mapCourierStatusToUi(status) {
  switch (status) {
    case 'waiting-for-pickup': return 'Waiting for Pickup';
    case 'package-picked-up': return 'Package Picked Up';
    case 'in-transit': return 'In Transit';
    case 'landed': return 'Landed / On the way to delivery';
    case 'delivered': return 'Delivered';
    default: return '';
  }
}

// Update progress lights according to status
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

  for (let i = 1; i <= numLights; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    const lineEl = document.getElementById(`line-${i}`);
    if (stepEl) stepEl.classList.remove('completed');
    if (lineEl) lineEl.classList.remove('completed');
  }

  if (idx === -1 || statusText.trim() === '') return;

  let lightsToTurnOn = idx > 0 ? Math.min(idx, numLights) : 0;

  for (let i = 1; i <= lightsToTurnOn; i++) {
    document.getElementById(`step-${i}`)?.classList.add('completed');
    if (i < lightsToTurnOn) {
      document.getElementById(`line-${i}`)?.classList.add('completed');
    }
  }
}

// Render job info on dashboard
function renderJobToDashboard(job) {
  document.querySelector(".job-id").textContent = `Job ID # ${job.jobId}`;
  document.querySelector(".status-badge").textContent = job.status || "Unknown";

  const infoItems = document.querySelectorAll(".info-item");
  if (infoItems.length >= 2) {
    infoItems[0].querySelector(".info-value").textContent = job.delivery?.address || "—";
    infoItems[1].querySelector(".info-value").textContent = job.delivery?.date || "—";
  }

  const uiStatus = mapCourierStatusToUi(job.courierStatus);
  updateStatusIcons(uiStatus);

  localStorage.setItem("currentJobId", job.jobId);
}

// Logout
function handleLogout() {
  localStorage.clear();
  window.location.href = "courier-login.html";
}

// Initial load of job data
document.addEventListener("DOMContentLoaded", async () => {
  const courierId = localStorage.getItem("courierId");
  if (!courierId) {
    alert("Missing courier ID. Please login again.");
    window.location.href = "courier-login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/current/${courierId}`);
    if (!res.ok) throw new Error("No job assigned to this courier");

    const data = await res.json();
    if (!data || !data.jobId) {
      document.querySelector(".main-content").innerHTML = "<p>No active job assigned.</p>";
      updateStatusIcons('');
      return;
    }

    currentJob = data;
    renderJobToDashboard(data);
  } catch (err) {
    console.error("Error loading courier job:", err);
    document.querySelector(".main-content").innerHTML = "<p>No active job assigned.</p>";
    updateStatusIcons('');
  }

  // Attach action buttons
  document.querySelectorAll(".action-button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");

      switch (action) {
        case "Call Center":
          if (!currentJob) {
            alert("Job data not loaded yet.");
            return;
          }

          let title = "";
          let phone = "";

          if (currentJob.courierStatus === "waiting-for-pickup") {
            title = "Pickup Center";
            phone = currentJob.pickup?.phone?.trim() || "";
          } else if (["package-picked-up", "in-transit", "landed", "delivered"].includes(currentJob.courierStatus)) {
            title = "Delivery Center";
            phone = currentJob.delivery?.phone?.trim() || "";
          }

          if (!phone) {
            alert(`No phone number available for ${title}.`);
            return;
          }

          openCallPopup(title, phone);
          break;

        case "Navigate":
          openDeliveryPopup();
          break;

        case "Chat":
          openChatPopup();
          break;

        case "Documents":
          openDocumentsPopup();
          break;
      }
    });
  });

  // Arrow to job details
  const jobArrow = document.getElementById("job-arrow");
  if (jobArrow) {
    jobArrow.addEventListener("click", () => {
      window.location.href = "courier-activeJob.html";
    });
  }

  // Logout button
  const logoutButton = document.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
});

// Load job map on page load if jobId exists
async function loadJob(jobId) {
  const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);
  if (!res.ok) throw new Error('Failed to load job');
  const job = await res.json();

  if (job.delivery?.lat && job.delivery?.lng) {
    initMap(job.delivery.lat, job.delivery.lng);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (currentJobId) {
    loadJob(currentJobId);
  }
});

// Load job documents dynamically
// Load job documents dynamically
async function loadDocuments(jobId) {
  const container = document.getElementById("documents-container");
  if (!container) return;

  container.innerHTML = "<p>Loading documents...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    const job = await res.json();

    // ✅ Use either `documents` or `files`
    const docs = job.documents || job.files || [];
    if (docs.length === 0) {
      container.innerHTML = "<p>No documents uploaded for this job.</p>";
      return;
    }

    // ✅ Build file URL (assuming your server exposes /uploads folder)
    container.innerHTML = docs.map(doc => {
      const fileUrl = `${API_BASE_URL}/uploads/${job.jobId}/${encodeURIComponent(doc.filename)}`;

      return `
        <section class="document-entry">
          <section class="document-label">${doc.filename}</section>
          <section class="document-actions">
            <a href="${fileUrl}" target="_blank">
              <img src="assets/icons/eye.svg" alt="View" />
            </a>
            <a href="${fileUrl}" download>
              <img src="assets/icons/download.svg" alt="Download" />
            </a>
          </section>
        </section>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading documents:", err);
    container.innerHTML = "<p>Failed to load documents.</p>";
  }
}


// Documents popup
function openDocumentsPopup() {
  document.getElementById("documents-popup").classList.remove("hidden");
  if (currentJobId) {
    loadDocuments(currentJobId);
  }
}
function closeDocumentsPopup() {
  document.getElementById("documents-popup").classList.add("hidden");
}

// Expose functions globally for inline handlers
window.callNumber           = callNumber;
window.closeBurgerMenu      = closeBurgerMenu;
window.closeCallPopup       = closeCallPopup;
window.closeChatPopup       = closeChatPopup;
window.closeDeliveryPopup   = closeDeliveryPopup;
window.closeDocumentsPopup  = closeDocumentsPopup;
window.copyAddress          = copyAddress;
window.openDocumentsPopup   = openDocumentsPopup;
window.openFullChat         = openFullChat;
window.sendChatMessage      = sendChatMessage;
window.toggleMenu           = toggleMenu;
