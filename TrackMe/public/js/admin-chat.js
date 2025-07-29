
import API_BASE_URL from './config.js';// Connect to Socket.IO server
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
  const backButton = document.getElementById("back-button");

  // Get jobId from URL using 'id' param
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    alert("Missing job ID in URL");
    return;
  }

  // Emit room join and set job title
  socket.emit('joinJobRoom', jobId);
  if (jobTitle) jobTitle.textContent = `Job # ${jobId}`;

  // Back button returns to job view
  if (backButton) {
    backButton.style.cursor = 'pointer';
    backButton.addEventListener('click', () => {
      window.location.href = `admin-viewJob.html?id=${encodeURIComponent(jobId)}`;
    });
  }

  // Helper to get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Append a message to the chat
  const addMessage = (text, isOutgoing = true, sender = 'other', time = null) => {
    const messageSection = document.createElement("section");
    messageSection.className = `message ${isOutgoing ? "outgoing" : "incoming"}`;

    const bubble = document.createElement("section");
    bubble.className = "bubble";
    bubble.textContent = text;

    const meta = document.createElement("section");
    meta.className = "meta";

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = time
      ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : getCurrentTime();

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

    chatArea.scrollTop = chatArea.scrollHeight;
  };

  // Send message on button click
  sendButton.addEventListener("click", () => {
    const text = inputField.value.trim();
    if (!text) return;

    addMessage(text, true);
    socket.emit('sendMessage', { jobId, message: text, sender: 'admin' });
    inputField.value = "";
  });

  // Send message on Enter key
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendButton.click();
    }
  });

  // Upload popup handlers
  attachIcon.addEventListener("click", () => {
    uploadPopup.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  cancelUpload.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  socket.on('receiveMessage', ({ message, sender, time, job }) => {
  if (job === jobId && sender !== 'admin') {
    addMessage(message, false, sender, time);
  }
});

});
