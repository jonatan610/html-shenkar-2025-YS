import API_BASE_URL from './config.js';
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("seeAllJobsBtn");

    btn?.addEventListener("click", () => {
        const hiddenJobs = document.getElementById("moreJobs");
        hiddenJobs?.classList.remove("hidden");
        btn.style.display = "none";
    });

    loadDynamicJobs(); 
});

async function loadDynamicJobs() {
    try {
        const res = await fetch("http://localhost:5500/api/jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const jobs = await res.json();
        const mainContainer = document.getElementById("dynamicJobsList");
        if (!mainContainer) return;

        mainContainer.innerHTML = "";

        // Create visible container
        const visibleWrapper = document.createElement("section");
        visibleWrapper.className = "jobs-list";

        // Create hidden container
        const hiddenWrapper = document.createElement("section");
        hiddenWrapper.id = "moreJobs";
        hiddenWrapper.className = "jobs-list hidden";

        jobs.forEach((job, index) => {
            const jobId = job.jobId || job._id?.slice(-5).toUpperCase();
            const deliveryDate = formatDate(job.delivery?.date);
            const destination = extractCountry(job.delivery?.address);
            const status = job.status || "active";

            const jobCard = document.createElement("a");
            jobCard.className = "job-link";
       jobCard.href = `admin-viewJob.html?id=${job.jobId || job._id}`;

            jobCard.innerHTML = `
                <article class="job-card">
                    <header class="job-header">
                        <span>Job ID</span>
                        <strong>${jobId}</strong>
                    </header>
                    <section class="job-info">
                        <section class="job-detail">
                            <img src="assets/icons/destination.svg" alt="Destination" />
                            <strong>Destination</strong>
                            <span>${destination}</span>
                        </section>
                        <section class="job-detail">
                            <img src="assets/icons/delivery.svg" alt="Delivery" />
                            <strong>Delivery</strong>
                            <span>${deliveryDate}</span>
                        </section>
                        <section class="job-status ${status.toLowerCase()}">${capitalize(status)}</section>
                    </section>
                </article>
            `;

            if (index < 4) {
                visibleWrapper.appendChild(jobCard); // First jobs visible
            } else {
                hiddenWrapper.appendChild(jobCard); // Rest hidden
            }
        });

        mainContainer.appendChild(visibleWrapper);
        if (jobs.length > 4) {
            mainContainer.appendChild(hiddenWrapper);
            document.querySelector(".see-all-wrapper")?.classList.remove("hidden");
        } else {
            document.querySelector(".see-all-wrapper")?.classList.add("hidden");
        }
    } catch (err) {
        console.error("Error loading jobs:", err.message);
    }
}

// ========== Helper functions ==========

function extractCountry(address = "") {
    if (!address || typeof address !== "string") return "Unknown";

    const parts = address.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return "Unknown";

    return parts[parts.length - 1].length >= 2 ? parts[parts.length - 1] : "Unknown";
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
}

function capitalize(str = "") {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
