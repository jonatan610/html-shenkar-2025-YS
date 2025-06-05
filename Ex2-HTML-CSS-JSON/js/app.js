// =======================
// DOM Elements Selection
// =======================
const cardsContainer = document.getElementById('cardsContainer');
const errorContainer = document.getElementById('errorContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// =======================
// Pride Mode Button Setup
// =======================
const prideToggle = document.createElement('button');
prideToggle.textContent = '🌈 Pride Mode';
prideToggle.className = 'btn btn-outline-primary ms-2';
prideToggle.id = 'prideToggle';
document.querySelector('header .container > section:last-child').appendChild(prideToggle);

// =======================
// Data Variables
// =======================
let items = [];
let filteredItems = [];

// =======================
// Card Creation Function
// =======================
function createCard(item) {
  return `
    <div class="col">
      <article class="card-custom">
        <section class="card-img-container">
          <img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'" />
        </section>
        <section class="card-body">
          <h3 class="card-title">${item.title}</h3>
          <span class="badge-author">${item.author}</span>
          <p class="card-text">${item.description}</p>
          <p class="card-meta"><strong>Year:</strong> ${item.year}</p>
          <p class="card-meta"><strong>Genre:</strong> ${item.genre}</p>
          <p class="card-meta"><strong>Rating:</strong> ${item.rating} <span class="rating-star">⭐</span></p>
        </section>
      </article>
    </div>
  `;
}

// =======================
// Card Display Function
// =======================
function displayCards(list) {
  if (list.length === 0) {
    errorContainer.textContent = "No items found.";
    cardsContainer.innerHTML = '';
    return;
  }
  errorContainer.textContent = '';
  cardsContainer.innerHTML = list.map(createCard).join('');
}

// =======================
// Data Fetch and Mapping
// =======================
fetch('data/items.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not OK');
    return response.json();
  })
  .then(data => {
    items = data.map(item => ({
      ...item,
      year: 2018 + (item.id % 5),
      rating: (Math.random() * 4 + 1).toFixed(1),
      genre: ['Programming', 'Design', 'JavaScript', 'NodeJS', 'CSS'][item.id % 5]
    }));
    filteredItems = items;
    displayCards(filteredItems);
  })
  .catch(() => {
    errorContainer.textContent = "Failed to load data.";
  });

// =======================
// Search Input Handling
// =======================
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredItems = items.filter(item => {
    return item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query);
  });
  sortAndDisplay();
});

// =======================
// Sorting Function
// =======================
function sortAndDisplay() {
  const value = sortSelect.value;
  if (!value) {
    displayCards(filteredItems);
    return;
  }
  const [field, direction] = value.split('-');
  filteredItems.sort((a, b) => {
    if (a[field].toLowerCase() < b[field].toLowerCase()) return direction === 'asc' ? -1 : 1;
    if (a[field].toLowerCase() > b[field].toLowerCase()) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  displayCards(filteredItems);
}

sortSelect.addEventListener('change', sortAndDisplay);

// =======================
// Theme Handling
// =======================
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// =======================
// Pride Mode Toggle
// =======================
const prideBackgroundClass = 'pride-background';

prideToggle.addEventListener('click', () => {
  if (document.body.classList.contains(prideBackgroundClass)) {
    document.body.classList.remove(prideBackgroundClass);
    prideToggle.classList.remove('btn-primary');
    prideToggle.classList.add('btn-outline-primary');
    localStorage.setItem('prideMode', 'off');
  } else {
    document.body.classList.add(prideBackgroundClass);
    prideToggle.classList.remove('btn-outline-primary');
    prideToggle.classList.add('btn-primary');
    localStorage.setItem('prideMode', 'on');
  }
});

// =======================
// Initialize Pride Mode
// =======================
const savedPrideMode = localStorage.getItem('prideMode') || 'off';

if (savedPrideMode === 'on') {
  document.body.classList.add(prideBackgroundClass);
  prideToggle.classList.remove('btn-outline-primary');
  prideToggle.classList.add('btn-primary');
}
