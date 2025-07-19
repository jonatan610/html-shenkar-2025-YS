
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const errorMessage = document.querySelector(".form-message.error");
  const errorText = errorMessage.querySelector(".text");
  const successMessage = document.querySelector(".form-message.success");

  if (!form || !usernameInput || !passwordInput || !errorMessage || !successMessage) {
    console.warn("One or more elements are missing in the DOM.");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Hide previous messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      errorText.textContent = "Please fill in all fields.";
      errorMessage.style.display = "flex";
      return;
    }

    // Simulated login (replace with real auth later)
    if (username === "courier" && password === "123456") {
      successMessage.style.display = "flex";
      setTimeout(() => {
        window.location.href = "courier-home.html";
      }, 1500);
    } else {
      errorText.textContent = "Incorrect username or password.";
      errorMessage.style.display = "flex";
    }
  });
});
