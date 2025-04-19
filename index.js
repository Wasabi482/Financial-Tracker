// Load from localStorage or set an empty object
let sectionsFinancial = JSON.parse(localStorage.getItem("sections")) || {};
let currentSectionKey = null; // For tracking which section we're adding to

// Save updated data to localStorage
function saveSections() {
  localStorage.setItem("sections", JSON.stringify(sectionsFinancial));
}

// Renders a section table with Edit and Delete buttons
function renderSection(sectionKey, containerId) {
  const container = document.getElementById(containerId);
  const items = sectionsFinancial[sectionKey];
  if (!items) return;

  const rows = items.map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.amount}</td>
      <td>
        <button class="edit-btn" data-index="${index}" data-section="${sectionKey}">Edit</button>
        <button class="delete-btn" data-index="${index}" data-section="${sectionKey}">Delete</button>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `<table>${rows}</table>`;

  container.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editItem(btn.dataset.section, parseInt(btn.dataset.index)));
  });

  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteItem(btn.dataset.section, parseInt(btn.dataset.index)));
  });
}

// Render all sections (excluding savings)
function renderAllSections() {
  const container = document.querySelector(".budget-container");

  container.querySelectorAll(".card").forEach(card => {
    if (!card.id.includes("savings")) card.remove();
  });

  for (const sectionKey in sectionsFinancial) {
    if (sectionKey === "savings") continue;

    const sectionId = `${sectionKey}-card`;
    const newCard = document.createElement("div");
    newCard.className = "card";
    newCard.id = sectionId;

    newCard.innerHTML = `
      <h3>${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}</h3>
      <div class="section-btn">
        <button class="remove">x</button>
        <button class="addlabel" data-section="${sectionKey}">+</button>
      </div>
      <div id="${sectionKey}-table" class="table-content"></div>
    `;

    container.insertBefore(newCard, document.getElementById("savings-card"));
    renderSection(sectionKey, `${sectionKey}-table`);
  }

  // Update savings display without calling updateSavings()
  const savings = sectionsFinancial.savings?.[0]?.amount;
  document.getElementById("savings-display").textContent = `Savings: ${savings ?? 0}`;
}

// Remove item from section
function deleteItem(section, index) {
  sectionsFinancial[section].splice(index, 1);
  saveSections();
  renderAllSections();
}

// Edit item name and amount
function editItem(section, index) {
  const item = sectionsFinancial[section][index];
  const newName = prompt("Edit name:", item.name);
  const newAmount = parseFloat(prompt("Edit amount:", item.amount));
  if (newName && !isNaN(newAmount)) {
    sectionsFinancial[section][index] = { name: newName, amount: newAmount };
    saveSections();
  }
}

// Show and hide modals
function openAddSectionModal() {
  document.getElementById("addSectionModal").style.display = "block";
}

function closeAddSectionModal() {
  document.getElementById("addSectionModal").style.display = "none";
}

function openAddModal(sectionKey) {
  currentSectionKey = sectionKey;
  addItem.style.display = "block";
}

function closeAddModal() {
  console.log("close");
  addItem.style.display = "none";
}

document.getElementById("save-item").addEventListener("click", () => {
  const name = document.getElementById("item-name").value.trim();
  const amount = parseFloat(document.getElementById("item-amount").value);

  if (!name || isNaN(amount)) {
    alert("Please enter valid name and amount.");
    return;
  }

  if (!sectionsFinancial[currentSectionKey]) {
    sectionsFinancial[currentSectionKey] = [];
  }

  sectionsFinancial[currentSectionKey].push({ name, amount });
  saveSections();
  renderAllSections();
  closeAddModal();
  
  // Clear fields
  document.getElementById("item-name").value = "";
  document.getElementById("item-amount").value = "";
});

// Save new section
document.getElementById("save-section").addEventListener("click", () => {
  const input = document.getElementById("section-name");
  const sectionName = input.value.trim();
  const sectionKey = sectionName.toLowerCase();

  if (!sectionName) return alert("Please enter a valid section name.");
  if (sectionsFinancial[sectionKey]) return alert("Section already exists!");

  sectionsFinancial[sectionKey] = [];
  saveSections();
  input.value = "";
  closeAddSectionModal();
  renderAllSections();
});

// Cancel buttons (for both modals)
document.querySelectorAll(".cancel").forEach(btn => {
  btn.addEventListener("click", () => {
    closeAddModal();
    closeAddSectionModal();
  });
});

// Open 'Add Section' modal
document.getElementById("addSection").addEventListener("click", openAddSectionModal);

// Handle button actions inside cards
document.querySelector(".budget-container").addEventListener("click", (e) => {
  const card = e.target.closest(".card");

  // Add item
  if (e.target.classList.contains("addlabel")) {
    openAddModal(e.target.dataset.section);
  }

  // Remove section
  if (e.target.classList.contains("remove")) {
    const sectionKey = card.id.replace("-card", "");
    if (sectionKey === "savings") return alert("You can't remove the Savings section.");
    if (confirm(`Are you sure you want to remove the "${sectionKey}" section?`)) {
      delete sectionsFinancial[sectionKey];
      saveSections();
      renderAllSections();
    }
  }
});

// Initial render
renderAllSections();

function updateSavings() {
  const salary = parseFloat(document.getElementById("salary-input").value);
  if (isNaN(salary)) return;

  let totalExpenses = 0;

  for (const key in sectionsFinancial) {
    if (key !== "savings") {
      const items = sectionsFinancial[key];
      totalExpenses += items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    }
  }

  const remaining = salary - totalExpenses;

  if (!sectionsFinancial.savings) {
    sectionsFinancial.savings = [{ name: "Savings", amount: 0 }];
  }

  sectionsFinancial.savings[0].amount = remaining;

  localStorage.setItem("sections", JSON.stringify(sectionsFinancial)); // Save without triggering updateSavings again
  renderAllSections();
}

  document.getElementById("salary-input").addEventListener("input", updateSavings);