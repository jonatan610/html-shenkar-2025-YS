import API_BASE_URL from './config.js';

const currentJobId = localStorage.getItem("currentJobId") || null;
let mapInitialized = false;
let currentJob = null;  

// === Burger Menu ===
function toggleMenu() {
  const menu = document.getElementById("burger-popup");
  menu.classList.toggle("hidden");
}
function closeBurgerMenu() {
  const menu = document.getElementById("burger-popup");
  menu.classList.add("hidden");
}

// === Chat Popup ===
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

// === Delivery Popup ===
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

  // Initialize map after short delay
  if (locationData?.lat && locationData?.lng) {
    setTimeout(() => {
      initMap(locationData.lat, locationData.lng);
    }, 250);
  }
}
function closeDeliveryPopup() {
  document.getElementById("delivery-popup").classList.add("hidden");
}

// === Google Maps Initialization ===
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

// === Copy Address ===
function copyAddress() {
  const address = document.getElementById("copy-address-btn")?.getAttribute("data-address") || "";
  if (!address) return alert("No address to copy");

  navigator.clipboard.writeText(address)
    .then(() => alert("Address copied to clipboard!"))
    .catch(() => alert("Failed to copy address."));
}

// === Call Popup ===
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

// === Chat Page ===
function openFullChat() {
  const jobId = localStorage.getItem("currentJobId");
  if (!jobId) {
    alert("No job selected for chat.");
    return;
  }
  window.location.href = `courier-chat.html?id=${jobId}`;
}

// === Map Courier Status to UI ===
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

// === Update Progress Lights ===
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

// === Render Job Info ===
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

// === Logout ===
function handleLogout() {
  localStorage.clear();
  window.location.href = "courier-login.html";
}

// === Initial Page Load ===
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

// === Load Job Map if jobId exists ===
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

// === Load Documents (with fixed download URLs) ===
async function loadDocuments(jobId) {
  const container = document.getElementById("documents-container");
  if (!container) return;

  container.innerHTML = "<p>Loading documents...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/by-jobid/${jobId}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    const job = await res.json();

    const docs = job.documents || job.files || [];
    if (docs.length === 0) {
      container.innerHTML = "<p>No documents uploaded for this job.</p>";
      return;
    }

    container.innerHTML = docs.map(doc => {
      // Preview link (direct from /uploads)
      const viewUrl = `${API_BASE_URL}/uploads/${job.jobId}/${encodeURIComponent(doc.filename)}`;
      // Download link (via /api/download to ensure correct filename & encoding)
      const downloadUrl = `${API_BASE_URL}/api/download/${job.jobId}/${encodeURIComponent(doc.filename)}`;

      return `
        <section class="document-entry">
          <section class="document-label">${doc.filename}</section>
          <section class="document-actions">
            <a href="${viewUrl}" target="_blank">
              <img src="assets/icons/eye.svg" alt="View" />
            </a>
            <a href="${downloadUrl}">
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

// === Documents Popup ===
function openDocumentsPopup() {
  document.getElementById("documents-popup").classList.remove("hidden");
  if (currentJobId) {
    loadDocuments(currentJobId);
  }
}
function closeDocumentsPopup() {
  document.getElementById("documents-popup").classList.add("hidden");
}

// === Expose Functions Globally ===
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

function extractUsernameFromEmail(email) {
    return email.split('@')[0];
}


const loggedInEmail = localStorage.getItem('userEmail'); 


if (loggedInEmail) {
    const username = extractUsernameFromEmail(loggedInEmail);
    const greetingElement = document.getElementById('courier-greeting');
    if (greetingElement) {
        greetingElement.textContent = `Hello, ${username}`;
    }
}
