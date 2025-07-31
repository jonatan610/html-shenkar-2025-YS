import API_BASE_URL from './config.js';

// Connect to Socket.IO server
const socket = io(API_BASE_URL);

document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector(".input-field");
  const sendButton = document.querySelector(".send-btn");
  const chatArea = document.querySelector(".chat-thread");
  const attachIcon = document.querySelector('img[alt="Attach"]');
  const uploadPopup = document.querySelector(".upload-popup");
  const closeBtn = document.querySelector(".close-btn");
  const cancelUpload = document.querySelector(".cancel-upload");
  const fileInput = document.querySelector(".upload-popup input[type='file']");
  const sendFileBtn = document.querySelector(".upload-popup .send-document");
  const uploadBox = document.querySelector(".upload-popup .upload-box");
  const messageInput = document.querySelector(".upload-popup textarea");
  const jobTitle = document.querySelector(".job");
  const backButton = document.getElementById("back-button");

  // Get jobId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    alert("Missing job ID in URL");
    return;
  }

  // Join room and set job title
  socket.emit('joinJobRoom', jobId);
  if (jobTitle) jobTitle.textContent = `Job # ${jobId}`;

  // Back button -> return to job view
  if (backButton) {
    backButton.style.cursor = 'pointer';
    backButton.addEventListener('click', () => {
      window.location.href = `admin-viewJob.html?id=${encodeURIComponent(jobId)}`;
    });
  }

  // Helper function: get current time formatted
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Append a message bubble into chat area
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

  // Send text message on button click
  sendButton.addEventListener("click", () => {
    const text = inputField.value.trim();
    if (!text) return;

    addMessage(text, true);
    socket.emit('sendMessage', { jobId, message: text, sender: 'admin' });
    inputField.value = "";
  });

  // Send text message on Enter key
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendButton.click();
    }
  });

  // Upload popup open
  attachIcon.addEventListener("click", () => {
    uploadPopup.classList.remove("hidden");
  });

  // Close popup
  closeBtn.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  // Cancel upload
  cancelUpload.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  // Handle file upload
  sendFileBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobId", jobId);
    formData.append("sender", "admin");
    if (messageInput.value.trim()) {
      formData.append("message", messageInput.value.trim());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();

      // Show file in chat
      addMessage(`📎 ${result.fileName}`, true);

      // Emit message to socket
      socket.emit("sendMessage", {
        jobId,
        message: result.fileUrl ? `File: ${result.fileUrl}` : result.fileName,
        sender: "admin",
      });

      // Reset popup
      fileInput.value = "";
      messageInput.value = "";
      uploadPopup.classList.add("hidden");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    }
  });

  // Handle receiving messages
  socket.on('receiveMessage', ({ message, sender, time, job }) => {
    if (job === jobId && sender !== 'admin') {
      addMessage(message, false, sender, time);
    }
  });

});
