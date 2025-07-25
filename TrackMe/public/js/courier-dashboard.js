let mapInitialized = false;



// ========== Toggle Burger Menu ========== //
function toggleMenu() {
    const menu = document.getElementById("burger-popup");
    menu.classList.toggle("hidden");
}

function closeBurgerMenu() {
    const menu = document.getElementById("burger-popup");
    menu.classList.add("hidden");
}

// ========== Documents Popup ========== //
function openDocumentsPopup() {
    document.getElementById("documents-popup").classList.remove("hidden");
}

function closeDocumentsPopup() {
    document.getElementById("documents-popup").classList.add("hidden");
}

// ========== Chat Popup ========== //
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
        // In real app: send to backend / append to chat
        alert("Message sent: " + message);
        input.value = "";
    }
}

function markProgress(currentStep) {
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`step-${i}`);
    const line = document.getElementById(`line-${i}`);
    
    if (step) {
      step.classList.toggle("completed", i <= currentStep);
    }
    if (line) {
      line.classList.toggle("completed", i < currentStep);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  markProgress(4); 
});



// ========== Delivery Location Popup ========== //
function openDeliveryPopup() {
  document.getElementById("delivery-popup").classList.remove("hidden");

  if (!mapInitialized) {
    setTimeout(() => {
      initMap();
      mapInitialized = true;
    }, 100);
  }
}
function copyAddress() {
  const address = "123 Mount Sinai Hospital, Manhattan, New York, NY 10029";
  navigator.clipboard.writeText(address)
    .then(() => {
      alert("Address copied to clipboard!");
    })
    .catch(() => {
      alert("Failed to copy address.");
    });
}



function closeDeliveryPopup() {
    document.getElementById("delivery-popup").classList.add("hidden");
}

function initMap() {
  const deliveryLocation = { lat: 40.7903, lng: -73.9536 }; // Mount Sinai Hospital

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: deliveryLocation,
  });

  new google.maps.Marker({
    position: deliveryLocation,
    map: map,
    title: "Mount Sinai Hospital"
  });
}

// ========== Call Popup ========== //
function openCallPopup(title, subtitle, phone, buttonText) {
    document.getElementById("call-popup").classList.remove("hidden");
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-subtitle").textContent = subtitle;
    document.getElementById("popup-phone").textContent = phone;
    document.getElementById("popup-button-text").textContent = buttonText;
}

function closeCallPopup() {
    document.getElementById("call-popup").classList.add("hidden");
}

function callNumber() {
    const number = document.getElementById("popup-phone").textContent;
    window.location.href = `tel:${number}`;
}

function openFullChat() {
  window.location.href = 'courier-chat.html';
}

function openDeliveryPopup() {
  document.getElementById("delivery-popup").classList.remove("hidden");

  setTimeout(() => {
    initMap();
  }, 100);
}

// ========== Button Actions ========== //
document.addEventListener("DOMContentLoaded", () => {
  // סמן התקדמות של שלבים
  markProgress(4); 

  // מאזין לכל כפתורי הפעולה
  document.querySelectorAll(".action-button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      switch (action) {
        case "Call Center":
          openCallPopup("Pickup Center", "Medical Center Reception", "+1-555-0123", "Call Pickup Center");
          break;
        case "Chat":
          openChatPopup();
          break;
        case "Navigate":
          openDeliveryPopup();
          break;
        case "Documents":
          openDocumentsPopup();
          break;
      }
    });
  });

  // מאזין ללחיצה על חץ ה־Job
  const jobArrow = document.getElementById("job-arrow");
  if (jobArrow) {
    jobArrow.addEventListener("click", () => {
      window.location.href = "courier-activeJob.html";
    });
  }
});
