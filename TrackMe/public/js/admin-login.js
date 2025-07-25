/**
 * Admin login script
 * Correct email: admin@trackme.com
 * Correct password: Admin@2024
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");
  const successMsg = document.getElementById("success-msg");
  const togglePasswordBtn = document.querySelector(".toggle-password-btn");
  const toggleIcon = togglePasswordBtn.querySelector("img");

  const CORRECT_EMAIL = "admin@trackme.com";
  const CORRECT_PASSWORD = "Admin@2024";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    hideMessages();

    if (!email || !password) {
      showError("Please fill in all fields");
      return;
    }

    if (email.toLowerCase() !== CORRECT_EMAIL || password !== CORRECT_PASSWORD) {
      showError("Incorrect username or password");
      return;
    }

    showSuccess("Login successful! Redirecting...");

    setTimeout(() => {
      window.location.href = "admin-dashboard.html";
    }, 1500);
  });

  togglePasswordBtn.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type");
    if (type === "password") {
      passwordInput.setAttribute("type", "text");
      toggleIcon.setAttribute("src", "assets/icons/eye-off.svg");
      toggleIcon.setAttribute("alt", "Hide password");
    } else {
      passwordInput.setAttribute("type", "password");
      toggleIcon.setAttribute("src", "assets/icons/eye.svg");
      toggleIcon.setAttribute("alt", "Show password");
    }
  });

  function hideMessages() {
    errorMsg.hidden = true;
    successMsg.hidden = true;
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
  }

  function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.hidden = false;
  }
});
