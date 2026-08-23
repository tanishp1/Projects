// ── Data ──────────────────────────────────────────────────────────────────────
const DEFAULT_TRANSACTIONS = [
  { id: 1, description: "Pizza Palace",    category: "Food",          date: "2026-04-18", amount: -42.00 },
  { id: 2, description: "Salary Deposit",  category: "Income",        date: "2026-04-15", amount: 2400.00 },
  { id: 3, description: "Electric Bill",   category: "Utilities",     date: "2026-04-12", amount: -95.00 },
  { id: 4, description: "Grocery Store",   category: "Food",          date: "2026-04-10", amount: -138.50 },
  { id: 5, description: "Spotify",         category: "Entertainment", date: "2026-04-08", amount: -9.99 },
  { id: 6, description: "Freelance Work",  category: "Income",        date: "2026-04-05", amount: 1880.00 },
  { id: 7, description: "Uber Ride",       category: "Transport",     date: "2026-04-03", amount: -22.50 },
  { id: 8, description: "Amazon Order",    category: "Shopping",      date: "2026-04-01", amount: -89.99 },
];

const CATEGORY_META = {
  Food:          { icon: "🍔", bg: "#fef3c7", color: "#f59e0b", textColor: "#92400e", badgeBg: "#fef3c7" },
  Transport:     { icon: "🚗", bg: "#ede9fe", color: "#8b5cf6", textColor: "#5b21b6", badgeBg: "#ede9fe" },
  Shopping:      { icon: "🛍️", bg: "#fee2e2", color: "#ea580c", textColor: "#9a3412", badgeBg: "#fee2e2" },
  Utilities:     { icon: "💡", bg: "#d1fae5", color: "#10b981", textColor: "#065f46", badgeBg: "#dbeafe" },
  Entertainment: { icon: "🎬", bg: "#dbeafe", color: "#3b82f6", textColor: "#1e40af", badgeBg: "#ede9fe" },
  Income:        { icon: "💰", bg: "#d1fae5", color: "#10b981", textColor: "#065f46", badgeBg: "#d1fae5" },
  Other:         { icon: "📦", bg: "#f3f4f6", color: "#6b7280", textColor: "#374151", badgeBg: "#f3f4f6" },
};

let transactions = JSON.parse(localStorage.getItem("et_transactions")) || DEFAULT_TRANSACTIONS;
let nextId = Math.max(...transactions.map(t => t.id), 0) + 1;
let currentFilter = "Monthly";

// ── Helpers ───────────────────────────────────────────────────────────────────
const save = () => localStorage.setItem("et_transactions", JSON.stringify(transactions));
const fmt  = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getFiltered() {
  const now = new Date();
  return transactions.filter(t => {
    const d = new Date(t.date);
    if (currentFilter === "Monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (currentFilter === "Weekly") {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo && d <= now;
    }
    if (currentFilter === "Yearly") return d.getFullYear() === now.getFullYear();
    return true;
  });
}

// ── Greeting ──────────────────────────────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  document.querySelector(".header h1").textContent = `👋 ${greet}`;
}

// ── Summary Cards ─────────────────────────────────────────────────────────────
function updateSummary() {
  const filtered = getFiltered();
  const income   = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  document.getElementById("total-income").textContent  = fmt(income);
  document.getElementById("total-expenses").textContent = fmt(expenses);

  // Progress bar on card: spending vs income
  const pct = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;
  document.querySelector(".my-card .progress-fill").style.width = pct + "%";
  document.querySelector(".spending-limit").innerHTML =
    `${fmt(expenses)} <span style="font-size:0.8rem;font-weight:400;opacity:0.8">/ ${fmt(income)}</span>`;
}

// ── Category Bars ─────────────────────────────────────────────────────────────
function updateCategories() {
  const filtered = getFiltered().filter(t => t.amount < 0);
  const totals = {};
  filtered.forEach(t => { totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount); });

  const max = Math.max(...Object.values(totals), 1);
  const list = document.querySelector(".category-list");
  list.innerHTML = "";

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  sorted.forEach(([cat, total]) => {
    const meta = CATEGORY_META[cat] || CATEGORY_META.Other;
    const pct  = (total / max) * 100;
    list.innerHTML += `
      <div class="category-item">
        <span class="category-icon" style="background:${meta.bg}">${meta.icon}</span>
        <div class="category-info">
          <div class="category-name">${cat}</div>
          <div class="progress-bar cat-bar">
            <div class="progress-fill" style="width:${pct}%;background:${meta.color}"></div>
          </div>
        </div>
        <span class="category-amount">${fmt(total)}</span>
      </div>`;
  });

  if (!sorted.length) list.innerHTML = `<p style="color:#9ca3af;font-size:0.875rem">No expense data.</p>`;
}

// ── Transactions Table ────────────────────────────────────────────────────────
function updateTable() {
  const filtered = [...getFiltered()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const tbody = document.querySelector(".transaction-table tbody");
  tbody.innerHTML = "";

  filtered.forEach(t => {
    const meta    = CATEGORY_META[t.category] || CATEGORY_META.Other;
    const isIncome = t.amount > 0;
    const dateStr  = new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    tbody.innerHTML += `
      <tr>
        <td>${t.description}</td>
        <td><span class="badge" style="background:${meta.badgeBg};color:${meta.textColor}">${t.category}</span></td>
        <td>${dateStr}</td>
        <td class="${isIncome ? "income" : "expense"}">${isIncome ? "+" : "-"}${fmt(t.amount)}</td>
        <td><button class="delete-btn" data-id="${t.id}" title="Delete">🗑️</button></td>
      </tr>`;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:1.5rem">No transactions found.</td></tr>`;
  }
}

// ── Add Transaction Modal ─────────────────────────────────────────────────────
function createModal() {
  const modal = document.createElement("div");
  modal.id = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>Add Transaction</h2>
        <button id="modal-close">✕</button>
      </div>
      <form id="transaction-form">
        <label>Description
          <input type="text" id="f-desc" placeholder="e.g. Coffee" required />
        </label>
        <label>Amount ($)
          <input type="number" id="f-amount" placeholder="e.g. 25.00" step="0.01" min="0.01" required />
        </label>
        <label>Type
          <select id="f-type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>Category
          <select id="f-category">
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Utilities</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
        </label>
        <label>Date
          <input type="date" id="f-date" required />
        </label>
        <button type="submit" class="export-btn" style="width:100%;margin-top:0.5rem">Add Transaction</button>
      </form>
    </div>`;
  document.body.appendChild(modal);

  // Set today as default date
  document.getElementById("f-date").value = new Date().toISOString().split("T")[0];

  // Hide category when income is selected
  document.getElementById("f-type").addEventListener("change", e => {
    document.getElementById("f-category").closest("label").style.display =
      e.target.value === "income" ? "none" : "flex";
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  document.getElementById("transaction-form").addEventListener("submit", e => {
    e.preventDefault();
    const desc   = document.getElementById("f-desc").value.trim();
    const amount = parseFloat(document.getElementById("f-amount").value);
    const type   = document.getElementById("f-type").value;
    const cat    = type === "income" ? "Income" : document.getElementById("f-category").value;
    const date   = document.getElementById("f-date").value;

    transactions.push({ id: nextId++, description: desc, category: cat, date, amount: type === "income" ? amount : -amount });
    save();
    refreshAll();
    closeModal();
  });
}

function openModal()  { createModal(); }
function closeModal() { document.getElementById("modal-overlay")?.remove(); }

// ── Delete Transaction ────────────────────────────────────────────────────────
document.querySelector(".transaction-table").addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  transactions = transactions.filter(t => t.id !== id);
  save();
  refreshAll();
});

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  const rows = [["Description", "Category", "Date", "Amount"]];
  getFiltered()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(t => rows.push([t.description, t.category, t.date, t.amount.toFixed(2)]));

  const csv  = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "expenses.csv" });
  a.click();
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────
document.querySelector(".dropdown").addEventListener("change", e => {
  currentFilter = e.target.value;
  refreshAll();
});

// ── Add Button (inject into header) ──────────────────────────────────────────
function injectAddButton() {
  const btn = document.createElement("button");
  btn.className = "export-btn";
  btn.textContent = "+ Add";
  btn.style.background = "#10b981";
  btn.addEventListener("click", openModal);
  document.querySelector(".header-control").prepend(btn);
}

// ── Modal Styles (injected once) ──────────────────────────────────────────────
function injectModalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal {
      background: white; border-radius: 14px; padding: 1.75rem;
      width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .modal-header h2 { font-size: 1.1rem; font-weight: 600; }
    #modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #6b7280; }
    #transaction-form { display: flex; flex-direction: column; gap: 0.85rem; }
    #transaction-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; font-weight: 500; color: #374151; }
    #transaction-form input, #transaction-form select {
      border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.75rem;
      font-size: 0.875rem; outline: none;
    }
    #transaction-form input:focus, #transaction-form select:focus { border-color: #10b981; }
    .delete-btn { background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.6; }
    .delete-btn:hover { opacity: 1; }
    .transaction-table th:last-child, .transaction-table td:last-child { text-align: center; width: 40px; }
  `;
  document.head.appendChild(style);
}

// ── "View All" toggle ─────────────────────────────────────────────────────────
let showAll = false;
document.querySelector(".card-menu[class='card-menu']") // last card-menu = "View All →"
document.querySelectorAll(".card-menu").forEach(btn => {
  if (btn.textContent.includes("View All")) {
    btn.addEventListener("click", () => {
      showAll = !showAll;
      btn.textContent = showAll ? "Show Less ←" : "View All →";
      refreshAll();
    });
  }
});

// ── Refresh All ───────────────────────────────────────────────────────────────
function refreshAll() {
  updateSummary();
  updateCategories();
  updateTable();
}

// ── Init ──────────────────────────────────────────────────────────────────────
injectModalStyles();
injectAddButton();
document.querySelector(".export-btn[class='export-btn']") // original export btn
document.querySelectorAll(".export-btn").forEach(btn => {
  if (btn.textContent.includes("Export")) btn.addEventListener("click", exportCSV);
});
setGreeting();
refreshAll();
