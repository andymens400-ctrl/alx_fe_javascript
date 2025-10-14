// Initial quotes
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The only way to do great work is to love what you do.", category: "Work" },
];

// Select main elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// --- Function to show a random quote ---
function showRandomQuote(category = null) {
  const filtered = category ? quotes.filter(q => q.category === category) : quotes;
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}"<br><em>— ${random.category}</em>`;
}

// --- Function to create a simple Add Quote form dynamically ---
function createAddQuoteForm() {
  // Prevent duplicate form creation
  if (document.getElementById("addQuoteForm")) return;

  const form = document.createElement("div");
  form.id = "addQuoteForm";
  form.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote"><br>
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category"><br>
    <button id="saveQuote">Add Quote</button>
    <button id="cancelForm">Cancel</button>
  `;
  document.body.appendChild(form);

  // Handle Add Quote button
  document.getElementById("saveQuote").addEventListener("click", addQuote);
  // Handle Cancel button
  document.getElementById("cancelForm").addEventListener("click", () => form.remove());
}

// --- Function to add a new quote ---
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  alert("Quote added!");
  textInput.value = "";
  catInput.value = "";
  showRandomQuote();
}

// --- Event listener for random quote button ---
newQuoteBtn.addEventListener("click", () => showRandomQuote());

// --- Display an initial quote ---
showRandomQuote();

// Optionally create the Add Quote form when the page loads
createAddQuoteForm();
