import API_BASE_URL from './config.js';
import { renderJobs } from './jobs-utils.js';

document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.querySelector(".jobs-list");

  const filterBtn = document.querySelector(".filter-btn");
  const sortBtn = document.querySelector(".sort-btn");
  const searchInput = document.querySelector(".search-input");

  const filterPopup = document.querySelector(".filter-popup");
  const sortPopup = document.querySelector(".sort-popup");
  const searchPopup = document.querySelector(".search-popup");

  const searchSubmitBtn = document.querySelector(".search-submit-btn");
  const searchInputPopup = document.querySelector(".search-input-popup");

  const applyFilterBtn = document.querySelector(".apply-btn");
  const closeButtons = document.querySelectorAll(".close-btn");

  const sortForm = document.querySelector(".sort-form");

  let allJobs = [];
  let displayedJobs = [];

  // Open popups
  filterBtn?.addEventListener("click", () => filterPopup?.classList.remove("hidden"));
  sortBtn?.addEventListener("click", () => sortPopup?.classList.remove("hidden"));
  searchInput?.addEventListener("focus", () => searchPopup?.classList.remove("hidden"));

  // Close popups
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const popup = btn.closest(".filter-popup, .sort-popup, .search-popup");
      popup?.classList.add("hidden");
    });
  });

  // Search
  searchSubmitBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const query = searchInputPopup.value.trim().toLowerCase();
    const filtered = displayedJobs.filter(job => {
      const id = (job.jobId || job._id || "").toString().toLowerCase();
      const dest = (job.delivery?.address || "").toLowerCase();
      const status = (job.status || "").toLowerCase();
      return id.includes(query) || dest.includes(query) || status.includes(query);
    });
    renderJobs(filtered, jobList);
    searchPopup.classList.add("hidden");
  });

  // Filter
  applyFilterBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const selectedStatuses = Array.from(document.querySelectorAll("input[name='status']:checked")).map(i => i.value.toLowerCase());
    const selectedDestinations = Array.from(document.querySelectorAll("input[name='destination']:checked")).map(i => i.value.toLowerCase());

    const filtered = displayedJobs.filter(job => {
      const status = (job.status || "").toLowerCase();
      const dest = (job.delivery?.address || "").toLowerCase();

      let match = true;
      if (selectedStatuses.length && !selectedStatuses.includes(status)) match = false;
      if (selectedDestinations.length && !selectedDestinations.some(d => dest.includes(d))) match = false;

      return match;
    });

    renderJobs(filtered, jobList);
    filterPopup.classList.add("hidden");
  });

  // Sort
  sortForm?.addEventListener("change", () => {
    const selected = sortForm.querySelector("input[name='sort']:checked")?.value;

    const sorted = [...displayedJobs].sort((a, b) => {
      const aDate = new Date(a.delivery?.date || 0);
      const bDate = new Date(b.delivery?.date || 0);

      const aDest = (a.delivery?.address || "").toLowerCase();
      const bDest = (b.delivery?.address || "").toLowerCase();

      const aStatus = (a.status || "").toLowerCase();
      const bStatus = (b.status || "").toLowerCase();

      switch (selected) {
        case "recent": return bDate - aDate;
        case "oldest": return aDate - bDate;
        case "az": return aDest.localeCompare(bDest);
        case "za": return bDest.localeCompare(aDest);
        case "status": return aStatus.localeCompare(bStatus);
        default: return 0;
      }
    });

    renderJobs(sorted, jobList);
    sortPopup?.classList.add("hidden");
  });

  // Load jobs (6 most recent)
  fetch(`${API_BASE_URL}/api/jobs`)
    .then(res => res.json())
    .then(jobs => {
       jobs.forEach(job => {
      if (!job.state) job.state = 'active'; 
    });

      allJobs = jobs.sort((a, b) => new Date(b.delivery?.date || 0) - new Date(a.delivery?.date || 0));
      displayedJobs = allJobs.slice(0, 6);
      renderJobs(displayedJobs, jobList);
    })
    .catch(err => {
      console.error("❌ Failed to load jobs:", err);
    });
});

// Burger menu
function toggleMenu() {
  document.getElementById("burger-popup").classList.remove("hidden");
}
function closeBurgerMenu() {
  document.getElementById("burger-popup").classList.add("hidden");
}
function handleLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'admin-login.html';
}

window.toggleMenu = toggleMenu;
window.closeBurgerMenu = closeBurgerMenu;
window.handleLogout = handleLogout;

