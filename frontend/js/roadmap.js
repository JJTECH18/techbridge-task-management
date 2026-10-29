// TechBridge Internship Roadmap
// Concepts used: variables, arrays, objects, functions, event listeners,
// conditional logic and DOM manipulation.

// ----- 1. Data: an object holding one ARRAY of task OBJECTS per track -----
const tracks = {
  'data-analytics': {
    name: 'Data Analytics',
    tasks: [
      { number: 1, title: `Data Cleaning Basics`, day: 1, difficulty: `Beginner`,
        description: `Clean a messy dataset using Google Sheets or Excel. Identify and fix duplicate rows, blank cells, inconsistent formatting, and incorrect data types.` },
      { number: 2, title: `Formulas & Pivot Tables`, day: 4, difficulty: `Beginner`,
        description: `Use spreadsheet formulas and Pivot Tables to answer questions and extract useful insights from a dataset.` },
      { number: 3, title: `Data Visualization`, day: 8, difficulty: `Beginner \u2192 Intermediate`,
        description: `Create charts and a simple dashboard that communicate useful insights from a dataset.` },
      { number: 4, title: `Introduction to SQL`, day: 11, difficulty: `Beginner \u2192 Intermediate`,
        description: `Practice basic SQL queries and use them to answer real-world questions about data.` },
      { number: 5, title: `SQL Joins & Aggregations`, day: 15, difficulty: `Intermediate`,
        description: `Use JOIN, GROUP BY and aggregate functions such as COUNT, SUM and AVG to analyze information across multiple tables.` },
      { number: 6, title: `Lookup Functions & Data Wrangling`, day: 19, difficulty: `Intermediate`,
        description: `Use VLOOKUP or XLOOKUP to combine related datasets and handle data mismatches.` },
      { number: 7, title: `Mini Analysis Project`, day: 22, difficulty: `Intermediate`,
        description: `Complete a small end-to-end analysis involving data cleaning, formulas, Pivot Tables, charts and recommendations.` },
      { number: 8, title: `Capstone Project`, day: 26, difficulty: `Intermediate`,
        description: `Complete a larger project combining spreadsheet analysis and SQL using at least two related tables.` }
    ]
  },
  'web-development': {
    name: 'Web Development',
    tasks: [
      { number: 1, title: `Build the TechBridge Homepage`, day: 1, difficulty: `Beginner`,
        description: `Create the first version of the TechBridge website using HTML and CSS.` },
      { number: 2, title: `Build the TechBridge Programs Experience`, day: 4, difficulty: `Beginner`,
        description: `Create a Programs experience presenting TechBridge's available learning programs.` },
      { number: 3, title: `Build the Internship Tasks Experience`, day: 8, difficulty: `Beginner \u2192 Intermediate`,
        description: `Create an interface that presents the TechBridge internship tasks and helps users understand the internship journey.` },
      { number: 4, title: `Build an Interactive Internship Roadmap`, day: 11, difficulty: `Beginner \u2192 Intermediate`,
        description: `Use JavaScript to allow visitors to switch between the Data Analytics and Web Development internship tracks.` },
      { number: 5, title: `Build the Intern Registration Experience`, day: 15, difficulty: `Intermediate`,
        description: `Create a professional registration and onboarding interface for TechBridge interns.` },
      { number: 6, title: `Build the Task Submission System`, day: 19, difficulty: `Intermediate`,
        description: `Create an interface through which interns can prepare and submit their task work.` },
      { number: 7, title: `Build the Intern Dashboard`, day: 22, difficulty: `Intermediate`,
        description: `Create a dashboard where an intern can view their profile, progress, tasks and submissions.` },
      { number: 8, title: `Build the Complete TechBridge Internship Platform`, day: 26, difficulty: `Intermediate`,
        description: `Combine the different components created during the internship into a complete TechBridge platform.` }
    ]
  }
};

// ----- 2. Variables: the default track and the track being shown now -----
const defaultTrack = 'data-analytics';
let currentTrack = defaultTrack;

// ----- 3. Page elements we will read from and change -----
const buttons = document.querySelectorAll('.track-btn');
const timeline = document.getElementById('timeline');
const trackName = document.getElementById('current-track');
const trackMeta = document.getElementById('current-meta');

// ----- 4. Functions -----
// Turn a difficulty label into a level number (conditional logic).
function getLevel(difficulty) {
  if (difficulty === 'Beginner') {
    return 1;
  } else if (difficulty === 'Beginner \u2192 Intermediate') {
    return 2;
  }
  return 3;
}

// Build the HTML for ONE task object.
function buildTask(task) {
  const level = getLevel(task.difficulty);
  return `
    <li class="t">
      <div class="dayc"><small>Day</small>${task.day}</div>
      <span class="node" aria-hidden="true">${task.number}</span>
      <article class="tcard">
        <p class="tnum">Task ${task.number}</p>
        <h3>${task.title}</h3>
        <p class="tdesc">${task.description}</p>
        <p class="lvl-row">
          <span class="badge b${level}">${task.difficulty}</span>
          <span class="meter m${level}" aria-hidden="true"><i></i><i></i><i></i></span>
        </p>
      </article>
    </li>`;
}

// Show the chosen track: update state, buttons, heading and task list (DOM manipulation).
function showTrack(key) {
  if (!tracks[key]) {
    key = defaultTrack;
  }
  currentTrack = key;
  const track = tracks[key];
  const lastDay = track.tasks[track.tasks.length - 1].day;

  buttons.forEach(function (button) {
    const isActive = button.dataset.track === currentTrack;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  trackName.textContent = track.name;
  trackMeta.textContent = track.tasks.length + ' tasks \u00b7 Day 1 to Day ' + lastDay + ' \u00b7 30-Day Practical Internship';

  timeline.dataset.track = currentTrack;
  timeline.innerHTML = track.tasks.map(buildTask).join('');

  // Restart the small entrance animation each time the track changes.
  timeline.classList.remove('swap');
  void timeline.offsetWidth;
  timeline.classList.add('swap');
}

// Read a track name from the web address, e.g. roadmap.html#web-development
function getTrackFromHash() {
  const key = window.location.hash.replace('#', '');
  return tracks[key] ? key : defaultTrack;
}

// ----- 5. Event listeners -----
buttons.forEach(function (button) {
  button.addEventListener('click', function () {
    const key = button.dataset.track;
    showTrack(key);
    history.replaceState(null, '', '#' + key);
  });
});

// ----- 6. Start: show a track as soon as the page loads -----
showTrack(getTrackFromHash());
