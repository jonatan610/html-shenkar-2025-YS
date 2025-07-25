/**
 * Example valid email: courier@trackme.com
 * Correct password: 123456
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const errorMessage = document.querySelector(".form-message.error");
  const errorText = errorMessage.querySelector(".text");
  const successMessage = document.querySelector(".form-message.success");

  const togglePasswordBtn = document.querySelector(".toggle-password-btn");
  const toggleIcon = togglePasswordBtn.querySelector("img");

  if (!form || !emailInput || !passwordInput || !errorMessage || !successMessage || !togglePasswordBtn) {
    console.warn("Missing elements in DOM.");
    return;
  }

  // Toggle password visibility
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Hide previous messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate empty fields
    if (!email || !password) {
      errorText.textContent = "Please fill in all fields.";
      errorMessage.style.display = "flex";
      return;
    }

    // Validate email domain @trackme.com
    const emailDomain = email.split("@")[1];
    if (!emailDomain || emailDomain.toLowerCase() !== "trackme.com") {
      errorText.textContent = "Email must have '@trackme.com' domain.";
      errorMessage.style.display = "flex";
      return;
    }

    // Check credentials (example validation)
    if (email.toLowerCase() === "courier@trackme.com" && password === "123456") {
      successMessage.style.display = "flex";
      setTimeout(() => {
        window.location.href = "courier-dashboard.html";
      }, 1500);
    } else {
      errorText.textContent = "Incorrect username or password.";
      errorMessage.style.display = "flex";
    }
  });
});
