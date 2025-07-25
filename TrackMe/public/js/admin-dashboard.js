document.addEventListener("DOMContentLoaded", () => {
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
  const jobList = document.querySelector(".jobs-list");

  filterBtn?.addEventListener("click", () => filterPopup?.classList.remove("hidden"));
  sortBtn?.addEventListener("click", () => sortPopup?.classList.remove("hidden"));
  searchInput?.addEventListener("focus", () => searchPopup?.classList.remove("hidden"));

  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const popup = btn.closest(".filter-popup, .sort-popup, .search-popup");
      popup?.classList.add("hidden");
    });
  });

  searchSubmitBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const query = searchInputPopup.value.trim().toLowerCase();

    document.querySelectorAll(".job-card").forEach(card => {
      const id = card.querySelector(".job-header strong")?.textContent.toLowerCase();
      const dest = card.querySelector(".job-detail:nth-child(1) span")?.textContent.toLowerCase();
      const status = card.querySelector(".job-status")?.textContent.toLowerCase();

      const match = id.includes(query) || dest.includes(query) || status.includes(query);
      card.closest(".job-link").style.display = match ? "block" : "none";
    });

    searchPopup.classList.add("hidden");
  });

  applyFilterBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const selectedStatuses = Array.from(document.querySelectorAll("input[name='status']:checked")).map(i => i.value);
    const selectedDestinations = Array.from(document.querySelectorAll("input[name='destination']:checked")).map(i => i.value);

    document.querySelectorAll(".job-card").forEach(card => {
      const status = card.querySelector(".job-status")?.textContent.toLowerCase();
      const destination = card.querySelector(".job-detail:nth-child(1) span")?.textContent.toLowerCase();

      let visible = true;

      if (selectedStatuses.length && !selectedStatuses.includes(status)) {
        visible = false;
      }

      if (selectedDestinations.length && !selectedDestinations.includes(destination)) {
        visible = false;
      }

      card.closest(".job-link").style.display = visible ? "block" : "none";
    });

    filterPopup.classList.add("hidden");
  });

  sortForm?.addEventListener("change", () => {
    const selected = sortForm.querySelector("input[name='sort']:checked")?.value;
    const jobLinks = Array.from(jobList.querySelectorAll(".job-link"));

    const sorted = jobLinks.sort((a, b) => {
      const aCard = a.querySelector(".job-card");
      const bCard = b.querySelector(".job-card");

      const aDate = new Date(aCard.querySelector(".job-detail:nth-child(2) span").textContent);
      const bDate = new Date(bCard.querySelector(".job-detail:nth-child(2) span").textContent);

      const aDest = aCard.querySelector(".job-detail:nth-child(1) span").textContent.trim().toLowerCase();
      const bDest = bCard.querySelector(".job-detail:nth-child(1) span").textContent.trim().toLowerCase();

      const aStatus = aCard.querySelector(".job-status").textContent.trim().toLowerCase();
      const bStatus = bCard.querySelector(".job-status").textContent.trim().toLowerCase();

      switch (selected) {
        case "recent":
          return bDate - aDate;
        case "oldest":
          return aDate - bDate;
        case "az":
          return aDest.localeCompare(bDest);
        case "za":
          return bDest.localeCompare(aDest);
        case "status":
          return aStatus.localeCompare(bStatus);
        default:
          return 0;
      }
    });

    jobList.innerHTML = "";
    sorted.forEach(link => jobList.appendChild(link));
    sortPopup?.classList.add("hidden");
  });
});

    function toggleMenu() {
            document.getElementById("burger-popup").classList.remove("hidden");
        }

        function closeBurgerMenu() {
            document.getElementById("burger-popup").classList.add("hidden");
        }

        function handleLogout() {
  // Optional: clear user data/session if stored
  // localStorage.clear(); or sessionStorage.clear();

  // Redirect to login page
  window.location.href = 'admin-login.html';
}
function handleLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'admin-login.html';
}
