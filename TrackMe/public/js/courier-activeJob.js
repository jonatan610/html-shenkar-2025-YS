// Show the status update confirmation popup
function showPopup(statusText) {
  const popup = document.getElementById('status-popup');
  const statusTextElement = document.getElementById('new-status-text');
  statusTextElement.textContent = statusText;
  popup.style.display = 'flex';
}

// Close the status update confirmation popup
function closePopup() {
  document.getElementById('status-popup').style.display = 'none';
}

// Confirm the new status and update the display
function confirmStatus() {
  const newStatus = document.getElementById('new-status-text').textContent;
  document.getElementById('current-status').textContent = newStatus;
  closePopup();
}

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Select the arrow element
  const jobArrow = document.getElementById('job-arrow');

  if (jobArrow) {
    // Change cursor to pointer to indicate it's clickable
    jobArrow.style.cursor = 'pointer';

    // Add click event listener to redirect to the home page
    jobArrow.addEventListener('click', () => {
      window.location.href = 'courier-dashboard.html'; // Change this URL to your home page
    });
  }
});
