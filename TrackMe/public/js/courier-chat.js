document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector(".input-field");
  const sendButton = document.querySelector(".send-btn");
  const chatArea = document.querySelector(".chat-area");
  const attachIcon = document.querySelector('img[alt="Attach"]');
  const uploadPopup = document.querySelector(".upload-popup");
  const closeBtn = document.querySelector(".close-btn");
  const cancelUpload = document.querySelector(".cancel-upload");

  // 🟦 Utility: get current time in HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 🟩 Add message to chat
  const addMessage = (text, isOutgoing = true) => {
    const messageSection = document.createElement("section");
    messageSection.className = `message ${isOutgoing ? "outgoing" : "incoming"}`;

    const bubble = document.createElement("section");
    bubble.className = "bubble";
    bubble.textContent = text;

    const meta = document.createElement("section");
    meta.className = "meta";

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = getCurrentTime();

    meta.appendChild(time);

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

  // ▶️ Send button click
  sendButton.addEventListener("click", () => {
    const text = inputField.value.trim();
    if (text) {
      addMessage(text, true);
      inputField.value = "";
    }
  });

  // ⏎ Enter key sends message
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendButton.click();
    }
  });

  // 📎 Show upload popup
  attachIcon.addEventListener("click", () => {
    uploadPopup.classList.remove("hidden");
  });

  // ❌ Close upload popup
  closeBtn.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });

  cancelUpload.addEventListener("click", () => {
    uploadPopup.classList.add("hidden");
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Select the back button element by id
  const backButton = document.getElementById('back-button');
  if (backButton) {
    // Change cursor to pointer to indicate clickable
    backButton.style.cursor = 'pointer';

    // Add click event listener to navigate back or to home page
    backButton.addEventListener('click', () => {
      // Option 1: Navigate back in history
      // window.history.back();

      // Option 2: Navigate to a specific page (e.g. courier-dashboard.html)
      window.location.href = 'courier-dashboard.html';
    });
  } else {
    console.error('Back button element not found');
  }
});
