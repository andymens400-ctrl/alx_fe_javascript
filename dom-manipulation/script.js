// --- Dynamic Quote Generator with LocalStorage, SessionStorage, Filtering, JSON Import/Export, and Server Sync ---

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
  if (!quoteDisplay) return;

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}"<br><em>— ${random.category}</em>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// --- Create Add Quote Form ---
function createAddQuoteForm() {
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

  document.getElementById("saveQuote").addEventListener("click", addQuote);
  document.getElementById("cancelForm").addEventListener("click", () => form.remove());
}

// --- Add New Quote ---
async function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  // Simulate sending new quote to the server
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    });
    console.log("Quote synced to server:", newQuote);
  } catch (error) {
    console.error("Failed to sync with server:", error);
  }

  alert("Quote added successfully!");
  textEl.value = "";
  catEl.value = "";

  populateCategories();
  showRandomQuote(category);
}

// --- Populate Categories Dropdown ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }

  categoryFilter.addEventListener("change", filterQuotes);
}

// --- Filter Quotes ---
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selected = categoryFilter ? categoryFilter.value : "All";
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote(selected);
}

// --- Restore Last Viewed Quote ---
function restoreLastQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  const savedCategory = localStorage.getItem("selectedCategory") || "All";

  if (lastQuote) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quoteDisplay) {
      quoteDisplay.innerHTML = `"${lastQuote.text}"<br><em>— ${lastQuote.category}</em>`;
    }
  } else {
    showRandomQuote(savedCategory);
  }
}

// --- Export Quotes as JSON ---
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

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. File must contain an array of quotes.");
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      showRandomQuote();
    } catch (error) {
      alert("Error reading file: Invalid JSON.");
    }
  };
  reader.readAsText(file);
}

// --- Server Sync Simulation ---
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error("Failed to fetch from server:", error);
  }
}

// Conflict resolution: server data takes precedence
function resolveConflicts(serverQuotes) {
  const localTexts = new Set(quotes.map(q => q.text));
  const newQuotes = serverQuotes.filter(q => !localTexts.has(q.text));

  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    showRandomQuote();

    showSyncNotification(`Synced ${newQuotes.length} new quotes from server.`);
  }
}

// Periodic sync
function startAutoSync() {
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000);
}

// Show sync notification
function showSyncNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #222;
    color: #fff;
    padding: 8px 12px;
    border-radius: 5px;
    opacity: 0.9;
  `;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 4000);
}

// --- Event Listeners ---
document.getElementById("newQuote").addEventListener("click", () => {
  const selected = document.getElementById("categoryFilter")?.value || "All";
  showRandomQuote(selected);
});
document.getElementById("exportBtn").addEventListener("click", exportQuotes);

// --- Initialize ---
populateCategories();
restoreLastQuote();
startAutoSync();
