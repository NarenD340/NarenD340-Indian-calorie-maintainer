let foodNutrients = {
  "dosai": { calories: 120, carbs: 16, protein: 3, fats: 5 },
  "idly": { calories: 59, carbs: 12, protein: 1, fats: 0.5 },
  "chicken": { calories_per_gram: 2, carbs: 0, protein: 0.25, fats: 0.05 },
  "rice": { calories_per_gram: 1.3, carbs: 0.45, protein: 0.043, fats: 0.004 },
  "ragi dosai": { calories: 100, carbs: 20, protein: 2, fats: 1 },
  "pongal": { calories: 319, carbs: 47, protein: 7, fats: 11 },
  "chappathi": { calories: 140, carbs: 23, protein: 4, fats: 2 }
};

const recommendedLimits = {
  calories: 2000,
  carbs: 300,
  protein: 50,
  fats: 70
};

let entries = JSON.parse(localStorage.getItem("entries")) || [];
const foodSelect = document.getElementById("food");

function populateFoodOptions() {
  foodSelect.innerHTML = '<option value="">-- Choose a food --</option>';
  for (let food in foodNutrients) {
    foodSelect.innerHTML += `<option value="${food}">${food}</option>`;
  }
}

function addFood() {
  const food = foodSelect.value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  if (!food || isNaN(quantity) || quantity <= 0) {
    alert("Please enter a valid food and quantity.");
    return;
  }
  entries.push({ food, quantity });
  localStorage.setItem("entries", JSON.stringify(entries));
  displayEntries();
}

function displayEntries() {
  const container = document.getElementById("entries");
  container.innerHTML = "<h3>Entries:</h3>";
  entries.forEach((entry, index) => {
    container.innerHTML += `
      <div class="entry">
        <span>${entry.quantity} × ${entry.food}</span>
        <button onclick="removeEntry(${index})">Remove</button>
      </div>`;
  });
}

function removeEntry(index) {
  entries.splice(index, 1);
  localStorage.setItem("entries", JSON.stringify(entries));
  displayEntries();
}

function showResults() {
  let totals = { calories: 0, carbs: 0, protein: 0, fats: 0 };
  entries.forEach(({ food, quantity }) => {
    let item = foodNutrients[food];
    if (!item) return;
    if (food === "rice" || food === "chicken") {
      totals.calories += item.calories_per_gram * quantity;
      totals.carbs += item.carbs * quantity;
      totals.protein += item.protein * quantity;
      totals.fats += item.fats * quantity;
    } else {
      totals.calories += item.calories * quantity;
      totals.carbs += item.carbs * quantity;
      totals.protein += item.protein * quantity;
      totals.fats += item.fats * quantity;
    }
  });

  const results = document.getElementById("results");
  const check = (val, lim) => val > lim 
    ? `<span style="color: #dc3545;">${(val - lim).toFixed(2)}g over</span>` 
    : `<span style="color: #28a745;">OK</span>`;

  results.innerHTML = `
    <strong>Calories:</strong> ${totals.calories.toFixed(2)} kcal 
    ${check(totals.calories, recommendedLimits.calories)}<br>
    <strong>Carbs:</strong> ${totals.carbs.toFixed(2)} g ${check(totals.carbs, recommendedLimits.carbs)}<br>
    <strong>Protein:</strong> ${totals.protein.toFixed(2)} g ${check(totals.protein, recommendedLimits.protein)}<br>
    <strong>Fats:</strong> ${totals.fats.toFixed(2)} g ${check(totals.fats, recommendedLimits.fats)}`;

  drawChart(totals.carbs, totals.protein, totals.fats);
}

function resetAll() {
  entries = [];
  localStorage.removeItem("entries");
  document.getElementById("entries").innerHTML = "";
  document.getElementById("results").innerHTML = "";
  if (chart) {
    chart.destroy();
  }
}

function addCustomFood() {
  const name = document.getElementById("custom-name").value.trim().toLowerCase();
  const calories = parseFloat(document.getElementById("custom-calories").value);
  const carbs = parseFloat(document.getElementById("custom-carbs").value);
  const protein = parseFloat(document.getElementById("custom-protein").value);
  const fats = parseFloat(document.getElementById("custom-fats").value);

  if (!name || isNaN(calories) || isNaN(carbs) || isNaN(protein) || isNaN(fats)) {
    alert("Please fill all fields with valid numbers.");
    return;
  }

  foodNutrients[name] = { calories, carbs, protein, fats };
  populateFoodOptions();
  alert(`${name} added successfully!`);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

let chart;
function drawChart(carbs, protein, fats) {
  if (chart) chart.destroy();
  const ctx = document.getElementById("macroChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Carbs", "Protein", "Fats"],
      datasets: [{
        data: [carbs, protein, fats],
        backgroundColor: ["#f9c74f", "#90be6d", "#f94144"]
      }]
    }
  });
}

// Initialize
populateFoodOptions();
displayEntries();
