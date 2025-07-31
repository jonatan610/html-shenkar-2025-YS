// Connect to Socket.IO server
import API_BASE_URL from './config.js';
const socket = io(API_BASE_URL);

document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector(".input-field");
  const sendButton = document.querySelector(".send-btn");
  const chatArea = document.querySelector(".chat-thread");
  const attachIcon = document.querySelector('img[alt="Attach"]');
  const uploadPopup = document.querySelector(".upload-popup");
  const closeBtn = document.querySelector(".close-btn");
  const cancelUpload = document.querySelector(".cancel-upload");
  const fileInput = document.getElementById("file-input"); // File input inside popup
  const uploadBtn = document.getElementById("upload-btn"); // Upload confirm button
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
  const addMessage = (text, isOutgoing = true, sender = 'courier', time = null, isFile = false) => {
    const messageSection = document.createElement("section");
    messageSection.className = `message ${isOutgoing ? "outgoing" : "incoming"}`;

    const bubble = document.createElement("section");
    bubble.className = "bubble";

    // If the message is a file link, render it as a clickable link
    if (isFile) {
      const link = document.createElement("a");
      link.href = text;
      link.target = "_blank";
      link.textContent = "📎 File";
      bubble.appendChild(link);
    } else {
      bubble.textContent = text;
    }

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

  // Send text message
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

  // Handle file upload
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file || !jobId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobId", jobId);
    formData.append("sender", "courier");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data?.fileUrl) {
        addMessage(data.fileUrl, true, "courier", null, true);
        socket.emit("sendMessage", { jobId, message: data.fileUrl, sender: "courier", isFile: true });
      }
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload file");
    }

    uploadPopup.classList.add("hidden");
    fileInput.value = "";
  });

  // Listen for incoming messages
  socket.on('receiveMessage', ({ message, sender, time, job, isFile }) => {
    if (job === jobId && sender !== 'courier') {
      addMessage(message, false, sender, time, isFile);
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
