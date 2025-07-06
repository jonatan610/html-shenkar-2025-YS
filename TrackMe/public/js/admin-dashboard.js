const jobsContainer = document.getElementById('jobsContainer');

function createJobCard(job) {
  return `
    <section class="job-card">
      <div>Job ID: ${job.id}</div>
      <div>Destination: ${job.destination}</div>
      <div>Delivery Date: ${job.deliveryDate}</div>
      <div>Status: ${job.status}</div>
    </section>
  `;
}

fetch('data/jobs.json')
  .then(response => response.json())
  .then(data => {
    const jobsHTML = data.jobs.map(createJobCard).join('');
    jobsContainer.innerHTML = jobsHTML;
  })
  .catch(err => {
    jobsContainer.innerHTML = '<p>Failed to load jobs data.</p>';
    console.error(err);
  });
