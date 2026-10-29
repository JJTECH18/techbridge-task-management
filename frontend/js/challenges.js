// TechBridge Challenge Hub
// JavaScript used: array of objects, variables, functions, event listeners,
// conditional logic (filters) and DOM manipulation (cards and details dialog).

// ----- 1. Data: an ARRAY of challenge OBJECTS -----
const challenges = [
  {
    id: 'sales-analysis', name: `Monthly Sales Analysis`, track: `Data Analytics`, difficulty: `Beginner`, time: `3-4 hours`,
    description: `Explore a small sales dataset to see which products and months perform best.`,
    outcome: `A summary table and two charts showing monthly sales performance and the top-selling products.`,
    objective: `Clean a small sales dataset, then use formulas and a Pivot Table to find the best-performing products and months.`,
    skills: [`Data cleaning`, `Spreadsheet formulas`, `Pivot Tables`, `Basic charts`],
    tools: [`Google Sheets`, `Excel`],
    deliverables: [`A cleaned spreadsheet`, `A Pivot Table of sales by month and product`, `Two charts`, `A short paragraph explaining your insights`]
  },
  {
    id: 'expense-analysis', name: `Expense Analysis`, track: `Data Analytics`, difficulty: `Beginner`, time: `2-3 hours`,
    description: `Organize a month of expenses and find out where the money goes.`,
    outcome: `A categorized expense sheet with a chart showing spending by category.`,
    objective: `Sort expenses into categories and summarize them to show where most of the spending happens.`,
    skills: [`Data entry and cleaning`, `SUM and SUMIF formulas`, `Charts`],
    tools: [`Google Sheets`, `Excel`],
    deliverables: [`A categorized expense sheet`, `A summary of spending by category`, `One chart`, `Two observations about the spending pattern`]
  },
  {
    id: 'customer-sql', name: `Customer Analysis with SQL`, track: `Data Analytics`, difficulty: `Intermediate`, time: `4-5 hours`,
    description: `Query a customers and orders dataset to learn who buys the most and how often.`,
    outcome: `A set of SQL queries and results that answer five business questions about customers.`,
    objective: `Write SQL queries using JOIN, GROUP BY and aggregate functions to answer questions about customers and their orders.`,
    skills: [`SQL SELECT`, `JOIN`, `GROUP BY`, `COUNT, SUM and AVG`],
    tools: [`SQLite or any SQL tool`, `Google Sheets for sharing results`],
    deliverables: [`A .sql file with your queries`, `A result table for each question`, `A short summary of your findings`]
  },
  {
    id: 'business-dashboard', name: `Business Performance Dashboard`, track: `Data Analytics`, difficulty: `Advanced`, time: `6-8 hours`,
    description: `Combine cleaned data, formulas and charts into a dashboard a manager could use.`,
    outcome: `A one-page dashboard showing key business metrics, with a written recommendation.`,
    objective: `Build an end-to-end analysis from raw data: clean it, analyze it, visualize it and recommend what the business should do.`,
    skills: [`Data cleaning`, `Pivot Tables`, `Data visualization`, `Business-focused analysis`, `SQL (optional)`],
    tools: [`Google Sheets`, `Excel`, `SQL (optional)`],
    deliverables: [`A cleaned dataset`, `Supporting Pivot Tables`, `A dashboard with at least four charts`, `A short recommendation for the business`]
  },
  {
    id: 'landing-page', name: `Responsive Landing Page`, track: `Web Development`, difficulty: `Beginner`, time: `3-4 hours`,
    description: `Design a landing page for an imaginary product or service that works on any screen.`,
    outcome: `A responsive landing page with a hero section, feature section and call-to-action, published online.`,
    objective: `Build a clean landing page with HTML and CSS that adapts to desktop, tablet and mobile screens.`,
    skills: [`HTML structure`, `CSS Flexbox and Grid`, `Media queries`],
    tools: [`Code editor`, `Browser`, `GitHub Pages or Netlify`],
    deliverables: [`index.html and style.css`, `A layout that adapts to three screen sizes`, `A live website link`]
  },
  {
    id: 'contact-form', name: `Contact Form with Validation`, track: `Web Development`, difficulty: `Beginner`, time: `3-4 hours`,
    description: `Build a clear contact form that checks the details before it can be sent.`,
    outcome: `A styled, accessible contact form that shows helpful messages for empty or invalid fields.`,
    objective: `Create a form with labeled fields, style it, and use JavaScript to validate the input.`,
    skills: [`HTML forms`, `CSS styling`, `JavaScript events and validation`],
    tools: [`Code editor`, `Browser`],
    deliverables: [`A form page (HTML, CSS and JavaScript)`, `Clear error messages for empty or invalid fields`, `A success message after valid input`]
  },
  {
    id: 'product-page', name: `Product Page with Image Gallery`, track: `Web Development`, difficulty: `Intermediate`, time: `4-5 hours`,
    description: `Create a product page for an imaginary item with a gallery, details and a call-to-action.`,
    outcome: `A responsive product page with a working image gallery and a clear buy button.`,
    objective: `Build a realistic product page using modern layout techniques and a simple interactive image gallery.`,
    skills: [`HTML and CSS`, `CSS Grid and Flexbox`, `JavaScript DOM manipulation`],
    tools: [`Code editor`, `Browser`, `Placeholder images`],
    deliverables: [`A product page`, `A gallery that switches the main image`, `A responsive layout`]
  },
  {
    id: 'portfolio-site', name: `Personal Portfolio Website`, track: `Web Development`, difficulty: `Intermediate`, time: `5-6 hours`,
    description: `Build a multi-section portfolio that introduces you, your skills and your projects.`,
    outcome: `A responsive portfolio with About, Skills and Projects sections and smooth navigation.`,
    objective: `Plan and build a personal website with a clear structure, easy navigation and a consistent design.`,
    skills: [`Semantic HTML`, `Consistent CSS design`, `Responsive design`, `Git and GitHub`],
    tools: [`Code editor`, `Git and GitHub`, `GitHub Pages or Netlify`],
    deliverables: [`A portfolio website`, `At least three project cards`, `A live link and a GitHub repository`]
  },
  {
    id: 'todo-app', name: `Interactive To-Do App`, track: `Web Development`, difficulty: `Advanced`, time: `6-8 hours`,
    description: `Build a to-do app where people can add, complete and delete tasks.`,
    outcome: `A working to-do app that remembers tasks after the page is refreshed.`,
    objective: `Use JavaScript to manage a list of tasks, update the page as it changes and save the data in the browser.`,
    skills: [`JavaScript arrays and objects`, `DOM manipulation`, `Event listeners`, `localStorage`],
    tools: [`Code editor`, `Browser developer tools`, `GitHub`],
    deliverables: [`A working app`, `Add, complete and delete features`, `Tasks saved with localStorage`, `A README explaining how it works`]
  }
];

// ----- 2. Variables: the current filter choices -----
let selectedTrack = 'all';
let selectedDifficulty = 'all';
let searchText = '';

// ----- 3. Page elements -----
const grid = document.getElementById('grid');
const emptyMessage = document.getElementById('empty');
const countText = document.getElementById('count');
const searchBox = document.getElementById('search');
const trackButtons = document.querySelectorAll('#track-filters .fbtn');
const difficultyButtons = document.querySelectorAll('#difficulty-filters .fbtn');
const resetButtons = document.querySelectorAll('.reset');
const detail = document.getElementById('detail');
const detailTrack = document.getElementById('d-track');
const detailTitle = document.getElementById('d-title');
const detailBody = document.getElementById('d-body');
const closeButton = document.getElementById('d-close');

// ----- 4. Functions -----
// Decide whether ONE challenge passes the current filters (conditional logic).
function matchesFilters(challenge) {
  const trackOk = selectedTrack === 'all' || challenge.track === selectedTrack;
  const difficultyOk = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
  const searchOk = challenge.name.toLowerCase().includes(searchText.toLowerCase());
  return trackOk && difficultyOk && searchOk;
}

// Pick the badge style and meter level for a difficulty.
function difficultyClass(difficulty) {
  if (difficulty === 'Beginner') {
    return { badge: 'b1', level: 1 };
  } else if (difficulty === 'Intermediate') {
    return { badge: 'b3', level: 2 };
  }
  return { badge: 'b4', level: 3 };
}

function difficultyHTML(difficulty) {
  const style = difficultyClass(difficulty);
  return `<span class="badge ${style.badge}">${difficulty}</span>` +
         `<span class="meter m${style.level}" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

// Build the card for ONE challenge.
function buildCard(challenge) {
  return `
    <article class="ccard" data-track="${challenge.track}">
      <div class="body">
        <p class="ctrack">${challenge.track}</p>
        <h3>${challenge.name}</h3>
        <p class="cdesc">${challenge.description}</p>
        <p class="cout"><b>Expected outcome:</b> ${challenge.outcome}</p>
        <p class="meta">${difficultyHTML(challenge.difficulty)}<span class="time">${challenge.time}</span></p>
      </div>
      <button type="button" class="btn btn-sm view-btn" data-id="${challenge.id}" aria-label="View challenge: ${challenge.name}">View Challenge</button>
    </article>`;
}

// Show the challenges that match the filters (DOM manipulation).
function renderChallenges() {
  const visible = challenges.filter(matchesFilters);

  grid.innerHTML = visible.map(buildCard).join('');
  countText.textContent = 'Showing ' + visible.length + ' of ' + challenges.length + ' challenges';
  emptyMessage.hidden = visible.length !== 0;

  grid.classList.remove('swap');
  void grid.offsetWidth;
  grid.classList.add('swap');
}

// Mark the chosen button in a filter group as pressed.
function updateButtons(buttons, value) {
  buttons.forEach(function (button) {
    button.setAttribute('aria-pressed', button.dataset.filter === value ? 'true' : 'false');
  });
}

// Open the details dialog for one challenge.
function openChallenge(id) {
  const challenge = challenges.find(function (item) { return item.id === id; });
  if (!challenge) {
    return;
  }
  detail.dataset.track = challenge.track;
  detailTrack.textContent = challenge.track;
  detailTitle.textContent = challenge.name;
  detailBody.innerHTML = `
    <p class="d-badges">${difficultyHTML(challenge.difficulty)}</p>
    <h3>Objective</h3>
    <p>${challenge.objective}</p>
    <h3>Skills required</h3>
    <ul class="chips">${challenge.skills.map(function (s) { return '<li>' + s + '</li>'; }).join('')}</ul>
    <h3>Tools that may be used</h3>
    <ul class="chips">${challenge.tools.map(function (t) { return '<li>' + t + '</li>'; }).join('')}</ul>
    <h3>What you need to produce</h3>
    <ul class="deliv">${challenge.deliverables.map(function (d) { return '<li>' + d + '</li>'; }).join('')}</ul>
    <div class="d-grid">
      <div><h3>Estimated time</h3><p>${challenge.time}</p></div>
      <div><h3>Expected result</h3><p>${challenge.outcome}</p></div>
    </div>
    <div class="d-actions">
      <a class="btn" href="https://forms.gle/8EbdSy5ttGfLZfjv5" target="_blank" rel="noopener">Apply for TechBridge Internship</a>
    </div>`;
  if (typeof detail.showModal === 'function') {
    detail.showModal();
  } else {
    detail.setAttribute('open', '');
  }
}

function closeDetail() {
  if (typeof detail.close === 'function') {
    detail.close();
  } else {
    detail.removeAttribute('open');
  }
}

function resetFilters() {
  selectedTrack = 'all';
  selectedDifficulty = 'all';
  searchText = '';
  searchBox.value = '';
  updateButtons(trackButtons, 'all');
  updateButtons(difficultyButtons, 'all');
  renderChallenges();
}

// ----- 5. Event listeners -----
trackButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    selectedTrack = button.dataset.filter;
    updateButtons(trackButtons, selectedTrack);
    renderChallenges();
  });
});

difficultyButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    selectedDifficulty = button.dataset.filter;
    updateButtons(difficultyButtons, selectedDifficulty);
    renderChallenges();
  });
});

searchBox.addEventListener('input', function () {
  searchText = searchBox.value.trim();
  renderChallenges();
});

resetButtons.forEach(function (button) {
  button.addEventListener('click', resetFilters);
});

// One listener on the grid handles every "View Challenge" button (event delegation).
grid.addEventListener('click', function (event) {
  const button = event.target.closest('.view-btn');
  if (button) {
    openChallenge(button.dataset.id);
  }
});

closeButton.addEventListener('click', closeDetail);
detail.addEventListener('click', function (event) {
  if (event.target === detail) {
    closeDetail();
  }
});

// ----- 6. Start -----
renderChallenges();
