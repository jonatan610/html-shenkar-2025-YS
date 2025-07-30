// === Burger menu handlers ===
export function toggleMenu() {
  document.getElementById("burger-popup")?.classList.remove("hidden");
}

export function closeBurgerMenu() {
  document.getElementById("burger-popup")?.classList.add("hidden");
}

// === Logout ===
export function handleLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'admin-login.html';
}

// === Navigation ===
export function goHome() {
  window.location.href = "admin-dashboard.html";
}

export function goJobs() {
  window.location.href = "admin-jobs.html";
}

export function goAddJob() {
  window.location.href = "admin-addJob.html";
}

// === Attach to window (כדי ש-onclick ב-HTML יעבוד) ===
window.toggleMenu = toggleMenu;
window.closeBurgerMenu = closeBurgerMenu;
window.handleLogout = handleLogout;

window.goHome = goHome;
window.goJobs = goJobs;
window.goAddJob = goAddJob;
