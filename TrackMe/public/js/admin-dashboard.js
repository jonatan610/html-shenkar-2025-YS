document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.querySelector(".filter-btn");
  const sortBtn = document.querySelector(".sort-btn");
  const closeButtons = document.querySelectorAll(".close-btn");
  const filterPopup = document.querySelector(".filter-popup");
  const sortPopup = document.querySelector(".sort-popup");
  const searchInput = document.querySelector(".search-input");
  const searchPopup = document.querySelector(".search-popup");
  const searchSubmitBtn = document.querySelector(".search-submit-btn");
  const searchInputPopup = document.querySelector(".search-input-popup");
  const jobCards = document.querySelectorAll(".job-card");

  // Open popups
  filterBtn?.addEventListener("click", () => {
    filterPopup?.classList.remove("hidden");
  });

  sortBtn?.addEventListener("click", () => {
    sortPopup?.classList.remove("hidden");
  });

  searchInput?.addEventListener("focus", () => {
    searchPopup?.classList.remove("hidden");
  });

  // Close popups
  closeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const popup = button.closest(".filter-popup, .sort-popup, .search-popup");
      popup?.classList.add("hidden");
    });
  });

  // Prevent default form submission
  const forms = document.querySelectorAll(".filter-form, .sort-form, .search-form");
  forms.forEach(form => {
    form.addEventListener("submit", e => e.preventDefault());
  });

  // Apply filter logic
  const applyFilterBtn = document.querySelector(".apply-btn");
  applyFilterBtn?.addEventListener("click", () => {
    const activeStatuses = Array.from(document.querySelectorAll("input[name='status']:checked")).map(el => el.value);
    const activeDestinations = Array.from(document.querySelectorAll("input[name='destination']:checked")).map(el => el.value);
    const activePriorities = Array.from(document.querySelectorAll("input[name='priority']:checked")).map(el => el.value);

    jobCards.forEach(card => {
      const status = card.querySelector(".job-status")?.textContent.trim().toLowerCase();
      const destination = card.querySelector(".job-detail:nth-child(1) span")?.textContent.trim().toLowerCase();
      let isVisible = true;

      if (activeStatuses.length > 0 && !activeStatuses.includes(status)) {
        isVisible = false;
      }
      if (activeDestinations.length > 0 && !activeDestinations.includes(destination)) {
        isVisible = false;
      }
      // Priority is not in job card UI, skipping this filter

      card.parentElement.style.display = isVisible ? "block" : "none";
    });

    filterPopup?.classList.add("hidden");
  });

  // Sort logic
  const sortForm = document.querySelector(".sort-form");
  sortForm?.addEventListener("change", () => {
    const selected = sortForm.querySelector("input[name='sort']:checked")?.value;
    const jobList = document.querySelector(".jobs-list");
    const jobArray = Array.from(jobList.querySelectorAll(".job-link"));

    const sorted = jobArray.sort((a, b) => {
      const aDate = new Date(a.querySelector(".job-detail:nth-child(2) span").textContent);
      const bDate = new Date(b.querySelector(".job-detail:nth-child(2) span").textContent);
      const aDest = a.querySelector(".job-detail:nth-child(1) span").textContent.trim().toLowerCase();
      const bDest = b.querySelector(".job-detail:nth-child(1) span").textContent.trim().toLowerCase();

      switch (selected) {
        case "date-asc":
          return aDate - bDate;
        case "date-desc":
          return bDate - aDate;
        case "destination":
          return aDest.localeCompare(bDest);
        default:
          return 0;
      }
    });

    jobList.innerHTML = "";
    sorted.forEach(card => jobList.appendChild(card));
    sortPopup?.classList.add("hidden");
  });

  // Search logic
  searchSubmitBtn?.addEventListener("click", () => {
    const query = searchInputPopup.value.trim().toLowerCase();

    jobCards.forEach(card => {
      const id = card.querySelector(".job-header strong").textContent.trim().toLowerCase();
      const destination = card.querySelector(".job-detail:nth-child(1) span").textContent.trim().toLowerCase();
      const status = card.querySelector(".job-status").textContent.trim().toLowerCase();

      const isMatch = id.includes(query) || destination.includes(query) || status.includes(query);
      card.parentElement.style.display = isMatch ? "block" : "none";
    });

    searchPopup?.classList.add("hidden");
  });
});
