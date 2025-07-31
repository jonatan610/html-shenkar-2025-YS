import API_BASE_URL from './config.js';
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

  // Handle login form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorText.textContent = "Please fill in all fields.";
      errorMessage.style.display = "flex";
      return;
    }

    try {
     const response = await fetch(`${API_BASE_URL}/api/couriers/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

      const result = await response.json();

     if (response.ok) {
  successMessage.style.display = "flex";

  // Store courier ID for session
  localStorage.setItem("courierId", result.courier.id);

  // Store current job ID 
  if (result.job && result.job.jobId) {
    localStorage.setItem("currentJobId", result.job.jobId);
  } else {
 
    localStorage.removeItem("currentJobId");
  }

  setTimeout(() => {
    window.location.href = "courier-dashboard.html";
  }, 1500);
      
      } else {
        errorText.textContent = result.message || "Login failed. Try again.";
        errorMessage.style.display = "flex";
      }
    } catch (err) {
      console.error("Login error:", err);
      errorText.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "flex";
    }
  });
});
