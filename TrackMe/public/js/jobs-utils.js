// jobs-utils.js
export function renderJobs(jobs, container) {
  if (!container) {
    console.warn("⚠️ renderJobs: container element not found");
    return;
  }

  container.innerHTML = "";

  jobs.forEach(job => {
    const country = extractCountry(job.delivery?.address || "");
    const deliveryDate = formatDate(job.delivery?.date);
    const status = job.status || "active";
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
