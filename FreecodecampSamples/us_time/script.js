// ---- Data: US states, capitals, time zones & offset from PHT (in hours) ----
// offsetFromPht: add this to PHT to get that state's local time.
const STATES = [
  { code: "AL", state: "Alabama", capital: "Montgomery", tz: "CST", offsetFromPht: -14 },
  { code: "AK", state: "Alaska", capital: "Juneau", tz: "AKST", offsetFromPht: -17 },
  { code: "AZ", state: "Arizona", capital: "Phoenix", tz: "MST", offsetFromPht: -15 },
  { code: "AR", state: "Arkansas", capital: "Little Rock", tz: "CST", offsetFromPht: -14 },
  { code: "CA", state: "California", capital: "Sacramento", tz: "PST", offsetFromPht: -16 },
  { code: "CO", state: "Colorado", capital: "Denver", tz: "MST", offsetFromPht: -15 },
  { code: "CT", state: "Connecticut", capital: "Hartford", tz: "EST", offsetFromPht: -13 },
  { code: "DE", state: "Delaware", capital: "Dover", tz: "EST", offsetFromPht: -13 },
  { code: "FL", state: "Florida", capital: "Tallahassee", tz: "EST", offsetFromPht: -13 },
  { code: "GA", state: "Georgia", capital: "Atlanta", tz: "EST", offsetFromPht: -13 },
  { code: "HI", state: "Hawaii", capital: "Honolulu", tz: "HST", offsetFromPht: -18 },
  { code: "ID", state: "Idaho", capital: "Boise", tz: "MST", offsetFromPht: -15 },
  { code: "IL", state: "Illinois", capital: "Springfield", tz: "CST", offsetFromPht: -14 },
  { code: "IN", state: "Indiana", capital: "Indianapolis", tz: "EST", offsetFromPht: -13 },
  { code: "IA", state: "Iowa", capital: "Des Moines", tz: "CST", offsetFromPht: -14 },
  { code: "KS", state: "Kansas", capital: "Topeka", tz: "CST", offsetFromPht: -14 },
  { code: "KY", state: "Kentucky", capital: "Frankfort", tz: "EST", offsetFromPht: -13 },
  { code: "LA", state: "Louisiana", capital: "Baton Rouge", tz: "CST", offsetFromPht: -14 },
  { code: "ME", state: "Maine", capital: "Augusta", tz: "EST", offsetFromPht: -13 },
  { code: "MD", state: "Maryland", capital: "Annapolis", tz: "EST", offsetFromPht: -13 },
  { code: "MA", state: "Massachusetts", capital: "Boston", tz: "EST", offsetFromPht: -13 },
  { code: "MI", state: "Michigan", capital: "Lansing", tz: "EST", offsetFromPht: -13 },
  { code: "MN", state: "Minnesota", capital: "Saint Paul", tz: "CST", offsetFromPht: -14 },
  { code: "MS", state: "Mississippi", capital: "Jackson", tz: "CST", offsetFromPht: -14 },
  { code: "MO", state: "Missouri", capital: "Jefferson City", tz: "CST", offsetFromPht: -14 },
  { code: "MT", state: "Montana", capital: "Helena", tz: "MST", offsetFromPht: -15 },
  { code: "NE", state: "Nebraska", capital: "Lincoln", tz: "CST", offsetFromPht: -14 },
  { code: "NV", state: "Nevada", capital: "Carson City", tz: "PST", offsetFromPht: -16 },
  { code: "NH", state: "New Hampshire", capital: "Concord", tz: "EST", offsetFromPht: -13 },
  { code: "NJ", state: "New Jersey", capital: "Trenton", tz: "EST", offsetFromPht: -13 },
  { code: "NM", state: "New Mexico", capital: "Santa Fe", tz: "MST", offsetFromPht: -15 },
  { code: "NY", state: "New York", capital: "Albany", tz: "EST", offsetFromPht: -13 },
  { code: "NC", state: "North Carolina", capital: "Raleigh", tz: "EST", offsetFromPht: -13 },
  { code: "ND", state: "North Dakota", capital: "Bismarck", tz: "CST", offsetFromPht: -14 },
  { code: "OH", state: "Ohio", capital: "Columbus", tz: "EST", offsetFromPht: -13 },
  { code: "OK", state: "Oklahoma", capital: "Oklahoma City", tz: "CST", offsetFromPht: -14 },
  { code: "OR", state: "Oregon", capital: "Salem", tz: "PST", offsetFromPht: -16 },
  { code: "PA", state: "Pennsylvania", capital: "Harrisburg", tz: "EST", offsetFromPht: -13 },
  { code: "RI", state: "Rhode Island", capital: "Providence", tz: "EST", offsetFromPht: -13 },
  { code: "SC", state: "South Carolina", capital: "Columbia", tz: "EST", offsetFromPht: -13 },
  { code: "SD", state: "South Dakota", capital: "Pierre", tz: "CST", offsetFromPht: -14 },
  { code: "TN", state: "Tennessee", capital: "Nashville", tz: "CST", offsetFromPht: -14 },
  { code: "TX", state: "Texas", capital: "Austin", tz: "CST", offsetFromPht: -14 },
  { code: "UT", state: "Utah", capital: "Salt Lake City", tz: "MST", offsetFromPht: -15 },
  { code: "VT", state: "Vermont", capital: "Montpelier", tz: "EST", offsetFromPht: -13 },
  { code: "VA", state: "Virginia", capital: "Richmond", tz: "EST", offsetFromPht: -13 },
  { code: "WA", state: "Washington", capital: "Olympia", tz: "PST", offsetFromPht: -16 },
  { code: "WV", state: "West Virginia", capital: "Charleston", tz: "EST", offsetFromPht: -13 },
  { code: "WI", state: "Wisconsin", capital: "Madison", tz: "CST", offsetFromPht: -14 },
  { code: "WY", state: "Wyoming", capital: "Cheyenne", tz: "MST", offsetFromPht: -15 }
];

const TZ_UTC_MAP = {
  EST: "UTC-5",
  CST: "UTC-6",
  MST: "UTC-7",
  PST: "UTC-8",
  AKST: "UTC-9",
  HST: "UTC-10"
};

const clockGrid = document.getElementById("clock-grid");
const phtClockEl = document.getElementById("pht-clock");
const searchInput = document.getElementById("search");
const timeZoneFilter = document.getElementById("timeZoneFilter");

const clockElementsByCode = {};

// Get the current time in PHT (UTC+8), regardless of user's local timezone
function getPhtNow() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const phtMs = utcMs + 8 * 60 * 60 * 1000; // PHT is UTC+8
  return new Date(phtMs);
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
}

function getDiffLabel(offsetFromPht) {
  const hours = Math.abs(offsetFromPht);
  const unit = hours === 1 ? "hour" : "hours";
  // All offsets are negative (US is "behind" PHT)
  return `${hours} ${unit} behind PHT`;
}

// Render all state cards
function renderCards() {
  clockGrid.innerHTML = "";

  STATES.forEach((s) => {
    const card = document.createElement("div");
    card.className = "clock-card";
    card.dataset.stateName = s.state.toLowerCase();
    card.dataset.capitalName = s.capital.toLowerCase();
    card.dataset.tzGroup = s.tz;

    const header = document.createElement("div");
    header.className = "clock-header";

    const title = document.createElement("h2");
    title.textContent = s.state;

    const codeEl = document.createElement("span");
    codeEl.className = "state-code";
    codeEl.textContent = s.code;

    header.appendChild(title);
    header.appendChild(codeEl);

    const capital = document.createElement("p");
    capital.className = "capital";
    capital.textContent = `Capital: ${s.capital}`;

    const meta = document.createElement("div");
    meta.className = "meta";

    const tz = document.createElement("p");
    tz.className = "timezone";
    tz.textContent = `${s.tz} (${TZ_UTC_MAP[s.tz]})`;

    const diff = document.createElement("p");
    diff.className = "diff";
    diff.textContent = getDiffLabel(s.offsetFromPht);

    meta.appendChild(tz);
    meta.appendChild(diff);

    const timeDisplay = document.createElement("div");
    timeDisplay.className = "time-display";
    timeDisplay.textContent = "--:--:--";
    clockElementsByCode[s.code] = {
      element: timeDisplay,
      offsetFromPht: s.offsetFromPht
    };

    card.appendChild(header);
    card.appendChild(capital);
    card.appendChild(meta);
    card.appendChild(timeDisplay);

    clockGrid.appendChild(card);
  });
}

function updateClocks() {
  const phtNow = getPhtNow();
  if (phtClockEl) {
    phtClockEl.textContent = formatTime(phtNow);
  }

  Object.keys(clockElementsByCode).forEach((code) => {
    const { element, offsetFromPht } = clockElementsByCode[code];
    const msOffset = offsetFromPht * 60 * 60 * 1000;
    const stateTime = new Date(phtNow.getTime() + msOffset);
    element.textContent = formatTime(stateTime);
  });
}

function applyFilters() {
  const q = (searchInput.value || "").toLowerCase().trim();
  const tz = timeZoneFilter.value;

  const cards = clockGrid.querySelectorAll(".clock-card");
  cards.forEach((card) => {
    const stateName = card.dataset.stateName;
    const capitalName = card.dataset.capitalName;
    const tzGroup = card.dataset.tzGroup;

    const matchesText =
      !q ||
      stateName.includes(q) ||
      capitalName.includes(q);

    const matchesTz = tz === "all" || tzGroup === tz;

    card.style.display = matchesText && matchesTz ? "" : "none";
  });
}

// Initial setup
renderCards();
updateClocks();
setInterval(updateClocks, 1000);

// Filters
searchInput.addEventListener("input", applyFilters);
timeZoneFilter.addEventListener("change", applyFilters);
