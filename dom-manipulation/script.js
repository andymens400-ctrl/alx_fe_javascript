// Basic quotes and categories
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The only way to do great work is to love what you do.", category: "Work" },
];

let categories = [...new Set(quotes.map(q => q.category))];

// Select main elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Create category dropdown and buttons
const controls = document.createElement("div");
controls.innerHTML = `
  <select id="categorySelect"></select>
  <button id="showCategoryQuote">Show Category Quote</button>
  <button id="addQuote">Add New Quote</button>
`;
document.body.insertBefore(controls, quoteDisplay);

const categorySelect = document.getElementById("categorySelect");
const showCategoryQuote = document.getElementById("showCategoryQuote");
const addQuote = document.getElementById("addQuote");

// Fill category dropdown
function updateCategories() {
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}
updateCategories();

// Show a random quote (optionally by category)
function showRandomQuote(category) {
  const filtered = category ? quotes.filter(q => q.category === category) : quotes;
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}"<br><em>— ${random.category}</em>`;
}

// Show form to add a quote
function showAddQuoteForm() {
  if (document.getElementById("quoteForm")) return; // prevent duplicates

  const form = document.createElement("form");
  form.id = "quoteForm";
  form.innerHTML = `
    <h3>Add a Quote</h3>
    <input id="quoteText" placeholder="Quote text" required><br>
    <input id="quoteCategory" placeholder="Category (new or existing)" required><br>
    <button>Add</button>
    <button type="button" id="cancel">Cancel</button>
  `;
  document.body.appendChild(form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = quoteText.value.trim();
    const category = quoteCategory.value.trim();
    if (!text || !category) return alert("Please fill in all fields.");

    quotes.push({ text, category });
    if (!categories.includes(category)) {
      categories.push(category);
      updateCategories();
    }
    form.remove();
    showRandomQuote();
  });

  document.getElementById("cancel").addEventListener("click", () => form.remove());
}

// Event listeners
newQuoteBtn.addEventListener("click", () => showRandomQuote());
showCategoryQuote.addEventListener("click", () => showRandomQuote(categorySelect.value));
addQuote.addEventListener("click", showAddQuoteForm);

// Initial quote
showRandomQuote();
