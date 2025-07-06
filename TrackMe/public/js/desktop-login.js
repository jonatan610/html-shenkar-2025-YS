console.log('desktop-login.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const emailInput = form.email;
  const passwordInput = form.password;
  const errorMessage = document.querySelector('.form-message.error');
  const errorText = errorMessage.querySelector('.text');
  const successMessage = document.querySelector('.form-message.success');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordField = passwordInput;

  togglePasswordBtn.addEventListener('click', () => {
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      togglePasswordBtn.querySelector('img').alt = 'Hide password';
    } else {
      passwordField.type = 'password';
      togglePasswordBtn.querySelector('img').alt = 'Show password';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorText.textContent = 'Please fill in all fields';
      errorMessage.style.display = 'flex';
      if (!email) emailInput.classList.add('input-error');
      if (!password) passwordInput.classList.add('input-error');
      return;
    }

    if (email !== 'user@example.com' || password !== 'password123') {
      errorText.textContent = 'Incorrect email or password.';
      errorMessage.style.display = 'flex';
      emailInput.classList.add('input-error');
      passwordInput.classList.add('input-error');
      return;
    }

    successMessage.style.display = 'flex';

    setTimeout(() => {
      // window.location.href = 'dashboard.html';
    }, 1500);
  });
});
