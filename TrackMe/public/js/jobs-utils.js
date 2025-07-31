// === Utility functions ===
function extractCountry(address = "") {
  const parts = address.split(",").map(p => p.trim());
  return parts[parts.length - 1] || "Unknown";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function renderJobs(jobs, container) {
  container.innerHTML = "";

  jobs.forEach(job => {
    const country = extractCountry(job.delivery?.address || "");
    const deliveryDate = formatDate(job.delivery?.date);
    const status = job.state || job.status || "active"; 
    const jobId = job.jobId || job._id?.slice(-5).toUpperCase();

    const card = document.createElement("a");
    card.href = `admin-viewJob.html?id=${job.jobId || job._id}`;
    card.className = "job-link";
    card.innerHTML = `
      <article class="job-card">
        <header class="job-header">
          <span>Job ID</span>
          <strong>${jobId}</strong>
        </header>
        <section class="job-info">
          <section class="job-detail">
            <img src="assets/icons/destination.svg" alt="Destination" />
            <strong>Destination</strong> <span>${country}</span>
          </section>
          <section class="job-detail">
            <img src="assets/icons/delivery.svg" alt="Delivery" />
            <strong>Delivery</strong> <span>${deliveryDate}</span>
          </section>
          <section class="job-status ${status.toLowerCase()}">${capitalize(status)}</section>
        </section>
      </article>
    `;
    container.appendChild(card);
  });
}
