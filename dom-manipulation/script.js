// script.js — JSON Import / Export + LocalStorage integration

// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The only way to do great work is to love what you do.", category: "Work" },
];

// Utility: persist quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Utility: show a quote (simple)
const quoteDisplay = document.getElementById("quoteDisplay");
function showRandomQuote() {
  if (!quotes.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = `"${q.text}"<br><em>— ${q.category}</em>`;
  // store last viewed quote in session storage (example usage)
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// Call once on load
showRandomQuote();

// Export: create downloadable JSON using Blob + createObjectURL
function exportQuotesToJson() {
  try {
    const jsonStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    // filename with date/time to avoid overwriting user files accidentally
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `quotes-${ts}.json`;
    document.body.appendChild(a); // required for Firefox
    a.click();
    a.remove();

    // free memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    alert("Unable to export quotes: " + err.message);
  }
}

// Wire export button
const exportBtn = document.getElementById("exportBtn");
if (exportBtn) exportBtn.addEventListener("click", exportQuotesToJson);

// Import: read JSON file and merge into quotes array
function isValidQuote(obj) {
  return obj && typeof obj === "object" && typeof obj.text === "string" && typeof obj.category === "string";
}


function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  // Basic client-side file size check (optional, prevents crazy-large uploads)
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeBytes) {
    alert("File is too large. Please select a file smaller than 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);

      if (!Array.isArray(parsed)) {
        throw new Error("Imported JSON must be an array of quote objects.");
      }

      // Validate each item and collect only valid quotes
      const incoming = parsed.filter(isValidQuote);
      if (incoming.length === 0) {
        alert("No valid quotes found in the file. Each quote must be an object with 'text' and 'category' strings.");
        return;
      }

      // Merge with deduplication (exact match on text + category)
      const existingSet = new Set(quotes.map(q => `${q.text}|||${q.category}`));
      let added = 0;
      incoming.forEach(q => {
        const key = `${q.text}|||${q.category}`;
        if (!existingSet.has(key)) {
          quotes.push({ text: q.text, category: q.category });
          existingSet.add(key);
          added++;
        }
      });

      if (added === 0) {
        alert("Import finished — no new quotes were added (duplicates detected).");
      } else {
        saveQuotes();
        alert(`Import finished — ${added} new quote(s) added.`);
        showRandomQuote();
      }

    } catch (err) {
      console.error(err);
      alert("Failed to import quotes: " + (err.message || "Invalid JSON file."));
    } finally {
      // Reset the file input so the same file can be imported again if needed
      if (event.target) event.target.value = "";
    }
  };

  reader.onerror = function () {
    alert("Error reading file.");
    reader.abort();
    if (event.target) event.target.value = "";
  };

  reader.readAsText(file);
}

// expose import function globally if HTML uses inline onchange
window.importFromJsonFile = importFromJsonFile;

// Example hook for an "Add Quote" button (if present)
function addQuoteFromInputs(textInputId = "newQuoteText", catInputId = "newQuoteCategory") {
  const textEl = document.getElementById(textInputId);
  const catEl = document.getElementById(catInputId);
  if (!textEl || !catEl) {
    alert("Add-quote inputs missing from DOM.");
    return;
  }
  const text = textEl.value.trim();
  const category = catEl.value.trim();
  if (!text || !category) return alert("Please enter both quote text and category.");

  quotes.push({ text, category });
  saveQuotes();
  textEl.value = "";
  catEl.value = "";
  alert("Quote added!");
  showRandomQuote();
}

// If you used <button id="addQuoteBtn"> in earlier code:
const addBtn = document.getElementById("addQuoteBtn");
if (addBtn) addBtn.addEventListener("click", () => addQuoteFromInputs());

// Save initial state (in case defaults were used)
saveQuotes();
