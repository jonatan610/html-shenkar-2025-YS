// Connect to Socket.IO server
import API_BASE_URL from './config.js';
const socket = io('http://localhost:5500');

document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector(".input-field");
  const sendButton = document.querySelector(".send-btn");
  const chatArea = document.querySelector(".chat-thread");
  const attachIcon = document.querySelector('img[alt="Attach"]');
  const uploadPopup = document.querySelector(".upload-popup");
  const closeBtn = document.querySelector(".close-btn");
  const cancelUpload = document.querySelector(".cancel-upload");
  const jobTitle = document.querySelector(".job");

  // Get jobId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (jobId) {
    socket.emit('joinJobRoom', jobId);
    if (jobTitle) jobTitle.textContent = `Job # ${jobId}`;
  } else {
    alert("Missing job ID in URL");
  }

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Add message to chat area
  const addMessage = (text, isOutgoing = true, sender = 'courier', time = null) => {
    const messageSection = document.createElement("section");
    messageSection.className = `message ${isOutgoing ? "outgoing" : "incoming"}`;

    const bubble = document.createElement("section");
    bubble.className = "bubble";
    bubble.textContent = text;

    const meta = document.createElement("section");
    meta.className = "meta";

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : getCurrentTime();

    meta.appendChild(timeSpan);

    if (isOutgoing) {
      const tick = document.createElement("img");
      tick.src = "assets/icons/tick.svg";
      tick.alt = "Sent";
      tick.className = "tick";
      meta.appendChild(tick);
    }

    messageSection.appendChild(bubble);
    messageSection.appendChild(meta);
    chatArea.appendChild(messageSection);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
  };

  // Send message
  sendButton.addEventListener("click", () => {
    const text = inputField.value.trim();
    if (!text || !jobId) return;

    addMessage(text, true);
    socket.emit('sendMessage', { jobId, message: text, sender: 'courier' });
    inputField.value = "";
  });

  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendButton.click();
    }
  });

  // Show upload popup
  attachIcon.addEventListener("click", () => {
    uploadPopup.classList.remove("hidden");
  });

  // Close upload popup
  closeBtn.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  cancelUpload.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

socket.on('receiveMessage', ({ message, sender, time, job }) => {
  if (job === jobId && sender !== 'courier') {
    addMessage(message, false, sender, time);
  }
});




  // Back button logic
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.style.cursor = 'pointer';
    backButton.addEventListener('click', () => {
      window.location.href = 'courier-dashboard.html';
    });
  }
});
