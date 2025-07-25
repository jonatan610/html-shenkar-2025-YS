        document.addEventListener("DOMContentLoaded", () => {
            const btn = document.getElementById("seeAllJobsBtn");
            const hiddenJobs = document.getElementById("moreJobs");

            btn.addEventListener("click", () => {
                hiddenJobs.classList.remove("hidden");
                btn.style.display = "none";
            });
        });