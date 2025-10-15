// --- Dynamic Quote Generator with LocalStorage, SessionStorage, and JSON Import/Export ---

// Load quotes from localStorage or use default ones
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The only way to do great work is to love what you do.", category: "Work" },
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Show Random Quote ---
function showRandomQuote(category = null) {
  const filtered = category && category !== "All"
    ? quotes.filter(q => q.category === category)
    : quotes;

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}"<br><em>— ${random.category}</em>`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// --- Create Add Quote Form ---
function createAddQuoteForm() {
  if (document.getElementById("addQuoteForm")) return; // avoid duplicates

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

  document.getElementById("saveQuote").addEventListener("click", addQuote);
  document.getElementById("cancelForm").addEventListener("click", () => form.remove());
}

// --- Add New Quote ---
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  alert("Quote added successfully!");
  textEl.value = "";
  catEl.value = "";

  populateCategories(); // ✅ update category list dynamically
  showRandomQuote(category); // show quote from new category
}

// --- Populate Categories Dropdown ---
function populateCategories() {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  // Extract unique categories
  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  // Clear dropdown and repopulate
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore saved filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categorySelect.value = savedCategory;
  }

  // Update displayed quote when category changes
  categorySelect.addEventListener("change", () => {
    const selected = categorySelect.value;
    localStorage.setItem("selectedCategory", selected);
    showRandomQuote(selected);
  });
}

// --- Restore last viewed quote ---
function restoreLastQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  const savedCategory = localStorage.getItem("selectedCategory") || "All";

  if (lastQuote) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `"${lastQuote.text}"<br><em>— ${lastQuote.category}</em>`;
  } else {
    showRandomQuote(savedCategory);
  }
}

// --- Export Quotes as JSON using Blob ---
function exportQuotes() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// --- Import Quotes from JSON File ---
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. File must contain an array of quotes.");
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories(); // ✅ update categories after import

      alert("Quotes imported successfully!");
      showRandomQuote();
    } catch (error) {
      alert("Error reading file: Invalid JSON.");
    }
  };
  fileReader.readAsText(file);
}

// --- Event Listeners ---
document.getElementById("newQuote").addEventListener("click", () => {
  const selected = document.getElementById("categorySelect")?.value || "All";
  showRandomQuote(selected);
});
document.getElementById("exportBtn").addEventListener("click", exportQuotes);

// --- Initialize ---
populateCategories();
restoreLastQuote();
