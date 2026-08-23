/* =========================================================================
   bmi.js — all logic for the LUXFIT BMI Calculator page (bmi.html)

   Sections:
     1. Config & shared state
     2. Local food database
     3. Height unit helpers
     4. BMI + diet recommendation
     5. Food autocomplete (local list + USDA API)
     6. Meal rows & calorie totals
     7. Meal suitability (is this amount of energy right for me?)
     8. Main Calculate handler
     9. Custom scroll-down choice bars (pretty <select> replacement)
    10. Live unit conversion (kg<->lbs, cm<->m<->ft/in)
   ========================================================================= */

/* ---------- 1. Config & shared state ---------------------------------- */
const USDA_API_KEY = "7x4GnZJw5qFD3J5gigdWI776cJ7cj2En0thJYlZ6";

let currentBMICategory = "";   // e.g. "Normal weight" — set after Calculate
let dailyTargetKcal = 0;       // estimated daily calorie need, 0 until calculated
let usdaDebounceTimer = null;  // avoids firing an API call on every keystroke

/* ---------- 2. Local food database (instant suggestions) --------------- */
const foodDatabase = [
    { name: "Avocado & Healthy Fats", cal: 160 },
    { name: "Nuts & Seeds", cal: 550 },
    { name: "Lean Chicken Breast", cal: 165 },
    { name: "Fresh Vegetables", cal: 35 },
    { name: "Lean Poultry", cal: 165 },
    { name: "Cooked Rice", cal: 130 },
    { name: "Leafy Spinach / Greens", cal: 23 },
    { name: "Lentils & Beans", cal: 116 },
    { name: "Fresh Berries", cal: 57 },
    { name: "Steamed Vegetables", cal: 35 },
    { name: "Lean Fish Fillet", cal: 110 },
    { name: "Leafy Greens", cal: 20 },
    { name: "Pork (Lean Curry)", cal: 242 },
    { name: "Beef (Lean Curry)", cal: 250 },
    { name: "Prawn / Shrimp", cal: 99 },
    { name: "Mohinga", cal: 120 },
    { name: "Tea Leaf Salad", cal: 280 },
    { name: "Boiled Egg", cal: 155 }
];

/* ---------- 3. Height unit helpers ------------------------------------ */
/* Shows either the single height field (cm/m) or the feet + inches pair. */
function toggleHeightInput() {
    const singleUnit = document.getElementById("heightUnit").value;
    const singleContainer = document.getElementById("singleHeightContainer");
    const feetContainer = document.getElementById("feetContainer");
    const heightUnitFt = document.getElementById("heightUnitFt");

    const useFeet = singleUnit === "ft" || heightUnitFt.value === "ft";
    singleContainer.classList.toggle("is-hidden", useFeet);
    feetContainer.classList.toggle("is-hidden", !useFeet);
}

/* ---------- 4. BMI + diet recommendation ------------------------------- */
function calculateBMI(weightKg, heightMeters) {
    return weightKg / (heightMeters * heightMeters);   // standard BMI formula
}

/* Returns the category name, advice text and 3 suggested foods for a BMI. */
function getDietDetails(bmi) {
    let category = "";
    let text = "";
    let foods = [];

    if (bmi < 18.5) {
        category = "Underweight";
        text = "Focus on a nutrient-dense calorie surplus. Include healthy protein, whole grains, and healthy fats to build lean mass.";
        foods = [
            { name: "Avocado & Healthy Fats", url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80", calPer100g: 160, defaultGrams: 150 },
            { name: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&q=80", calPer100g: 550, defaultGrams: 50 },
            { name: "Lean Chicken Breast", url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80", calPer100g: 165, defaultGrams: 150 }
        ];
    } else if (bmi < 25.0) {
        category = "Normal weight";
        text = "Maintain a balanced diet with whole foods, lean proteins, fresh vegetables, and rice to keep energy levels stable.";
        foods = [
            { name: "Fresh Vegetables", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80", calPer100g: 35, defaultGrams: 150 },
            { name: "Lean Poultry", url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80", calPer100g: 165, defaultGrams: 150 },
            { name: "Cooked Rice", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80", calPer100g: 130, defaultGrams: 150 }
        ];
    } else if (bmi < 30.0) {
        category = "Overweight";
        text = "Aim for a slight caloric deficit. Focus on high-fiber greens, prioritize lean protein, and reduce heavy oils.";
        foods = [
            { name: "Leafy Spinach / Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80", calPer100g: 23, defaultGrams: 150 },
            { name: "Lentils & Beans", url: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=300&q=80", calPer100g: 116, defaultGrams: 120 },
            { name: "Fresh Berries", url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=80", calPer100g: 57, defaultGrams: 100 }
        ];
    } else {
        category = "Obese";
        text = "Focus on a structured caloric deficit with whole foods. Eliminate deep-fried snacks, sugary drinks, and excess oil in curries.";
        foods = [
            { name: "Steamed Vegetables", url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80", calPer100g: 35, defaultGrams: 200 },
            { name: "Lean Fish Fillet", url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80", calPer100g: 110, defaultGrams: 150 },
            { name: "Leafy Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80", calPer100g: 20, defaultGrams: 150 }
        ];
    }

    return { category, text, foods };
}

/* ---------- 5. Food autocomplete --------------------------------------- */
/* Wires a food-name input so typing shows suggestions and fills kcal/100g. */
function setupAutocomplete(inputElement, kcalInputElement) {
    inputElement.addEventListener("input", function () {
        const val = this.value.trim();
        closeAllLists();

        if (!val) {                       // cleared field -> reset its calories
            kcalInputElement.value = 0;
            recalculateTotalCalories();
            return false;
        }

        const listContainer = document.createElement("DIV");
        listContainer.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(listContainer);

        // a) instant matches from the local database
        foodDatabase.forEach(item => {
            if (item.name.toLowerCase().includes(val.toLowerCase())) {
                const itemDiv = document.createElement("DIV");
                itemDiv.innerHTML = `<span><strong>${item.name}</strong></span><span class="cal-value">${item.cal} kcal</span>`;
                itemDiv.addEventListener("click", function () {
                    inputElement.value = item.name;
                    kcalInputElement.value = item.cal;
                    closeAllLists();
                    recalculateTotalCalories();
                });
                listContainer.appendChild(itemDiv);
            }
        });

        // b) extra matches from the USDA API (debounced by 300ms)
        if (val.length >= 2) {
            if (usdaDebounceTimer) clearTimeout(usdaDebounceTimer);
            usdaDebounceTimer = setTimeout(() => {
                fetchUsdaFoods(val, listContainer, inputElement, kcalInputElement);
            }, 300);
        }
    });
}

/* Queries the USDA food database and appends the results to the list. */
async function fetchUsdaFoods(query, listContainer, inputElement, kcalInputElement) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=5`;

    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.foods || data.foods.length === 0) return;

        data.foods.forEach(food => {
            // find the "Energy" nutrient measured in kcal
            const energyNutrient = food.foodNutrients
                ? food.foodNutrients.find(n =>
                    (n.nutrientName && n.nutrientName.toLowerCase().includes("energy") && n.unitName === "KCAL") ||
                    n.nutrientId === 1008)
                : null;

            const kcal = energyNutrient ? Math.round(energyNutrient.value) : 0;
            const foodName = food.description;

            const itemDiv = document.createElement("DIV");
            itemDiv.innerHTML = `<span>${foodName} <small class="usda-tag">(USDA)</small></span><span class="cal-value">${kcal} kcal</span>`;
            itemDiv.addEventListener("click", function () {
                inputElement.value = foodName;
                kcalInputElement.value = kcal;
                closeAllLists();
                recalculateTotalCalories();
            });
            listContainer.appendChild(itemDiv);
        });
    } catch (err) {
        console.error("USDA API error:", err);
    }
}

/* Removes every open suggestion list (except the one passed in, if any). */
function closeAllLists(elmnt) {
    const items = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < items.length; i++) {
        if (elmnt != items[i]) items[i].parentNode.removeChild(items[i]);
    }
}
document.addEventListener("click", e => closeAllLists(e.target));

/* ---------- 6. Meal rows & calorie totals ------------------------------ */
function addFoodRow(foodName = "", calPer100g = 0, grams = 100) {
    const container = document.getElementById("calorieRowsContainer");
    const row = document.createElement("div");
    row.className = "food-select-row";

    const itemNum = container.children.length + 1;
    row.innerHTML = `
        <strong class="item-label">Item ${itemNum}:</strong>
        <div class="food-input-container">
            <input type="text" class="food-name-input" value="${foodName}" placeholder="Start typing...">
        </div>
        <div class="kcal-input-container">
            <input type="number" class="cal-input" value="${calPer100g}" readonly tabindex="-1">
            <span class="unit-hint">kcal/100g</span>
        </div>
        <div class="portion-input-container">
            <input type="number" class="gram-input" value="${grams}" min="0" step="5" oninput="recalculateTotalCalories()">
            <span class="unit-hint">grams (g)</span>
        </div>
        <button class="remove-btn" onclick="removeFoodRow(this)">✕</button>
    `;

    container.appendChild(row);
    setupAutocomplete(row.querySelector(".food-name-input"), row.querySelector(".cal-input"));
    recalculateTotalCalories();
}

function removeFoodRow(btn) {
    btn.closest(".food-select-row").remove();
    recalculateTotalCalories();
}

/* Adds up (grams / 100) * kcal-per-100g for every row. */
function recalculateTotalCalories() {
    let total = 0;

    document.querySelectorAll(".food-select-row").forEach(row => {
        const calPer100g = parseFloat(row.querySelector(".cal-input").value) || 0;
        const grams = parseFloat(row.querySelector(".gram-input").value) || 0;
        if (calPer100g > 0 && grams > 0) total += (grams / 100) * calPer100g;
    });

    const roundTotal = Math.round(total);
    document.getElementById("totalCalorieBox").textContent = `Estimated Meal Total: ${roundTotal} kcal`;
    updateSuitability(roundTotal);
}

/* ---------- 7. Meal suitability ---------------------------------------- */
/* Estimates daily calorie need with Mifflin-St Jeor, adjusted by BMI class. */
function estimateDailyCalories(weightKg, heightCm, age, gender, category) {
    const safeAge = age > 0 ? age : 25;
    let bmr;
    if (gender === "male")        bmr = 10 * weightKg + 6.25 * heightCm - 5 * safeAge + 5;
    else if (gender === "female") bmr = 10 * weightKg + 6.25 * heightCm - 5 * safeAge - 161;
    else                          bmr = 10 * weightKg + 6.25 * heightCm - 5 * safeAge - 78;

    let daily = bmr * 1.375;                       // light activity factor
    if (category === "Underweight") daily += 300;  // surplus to gain
    else if (category === "Overweight") daily -= 300;
    else if (category.indexOf("Obese") !== -1) daily -= 500;

    return Math.max(1200, daily);                  // never advise below 1200 kcal
}

/* Writes the line under the meal total telling the user if it suits them.
   Safety rule: always warn to eat properly when too low, and not to eat it
   all at once when too high — whatever the body type is.                */
function updateSuitability(total) {
    const box = document.getElementById("suitabilityBox");
    if (!box) return;
    box.classList.remove("suit-good", "suit-low", "suit-high");

    if (!dailyTargetKcal) {
        box.textContent = "Calculate your BMI first to see whether this amount of energy suits your body type.";
        return;
    }

    const mealTarget = Math.round(dailyTargetKcal / 3);   // roughly 3 meals a day
    const low  = Math.round(mealTarget * 0.75);
    const high = Math.round(mealTarget * 1.25);
    let title, body, cls;

    if (total <= 0) {
        title = "No food added yet";
        body = `For your ${currentBMICategory.toLowerCase()} body type, aim for about ${mealTarget} kcal per meal (${Math.round(dailyTargetKcal)} kcal a day).`;
        cls = "suit-low";
    } else if (total < low) {
        title = "Too little energy for this meal";
        body = `This is below the ~${mealTarget} kcal your ${currentBMICategory.toLowerCase()} body type needs per meal. Add more nutrient-dense food.`;
        cls = "suit-low";
    } else if (total > high) {
        title = "More energy than one meal needs";
        body = `This is above the ~${mealTarget} kcal per meal suited to your ${currentBMICategory.toLowerCase()} body type.`;
        cls = "suit-high";
    } else {
        title = "Suitable for you";
        body = `This sits close to the ~${mealTarget} kcal per meal that suits your ${currentBMICategory.toLowerCase()} body type.`;
        cls = "suit-good";
    }

    let note = "Eat properly and regularly — never skip meals or starve yourself to hit a number.";
    if (total > high) note = "Don't eat it all at once — split this into smaller portions across the day.";
    else if (total < low && total > 0) note = "Eat properly: too little energy leaves you tired and slows your metabolism.";

    box.classList.add(cls);
    box.innerHTML = `<strong>${title}</strong>${body}<span class="suit-note">${note}</span>`;
}

/* ---------- 8. Main Calculate handler ---------------------------------- */
function processBMI() {
    const ageInput    = parseInt(document.getElementById("age").value, 10);
    const genderInput = document.getElementById("gender").value;
    const weightInput = parseFloat(document.getElementById("weight").value);
    const weightUnit  = document.getElementById("weightUnit").value;

    const bmiBox            = document.getElementById("bmiValue");
    const categoryBox       = document.getElementById("categoryValue");
    const recommendationText = document.getElementById("recommendationText");
    const foodGallery       = document.getElementById("foodGallery");
    const calorieCardBox    = document.getElementById("calorieCardBox");
    const calorieRowsContainer = document.getElementById("calorieRowsContainer");

    /* -- work out height in metres from whichever unit is active -- */
    let heightMeters = 0;
    const singleUnit = document.getElementById("heightUnit").value;
    if (singleUnit === "ft" || document.getElementById("heightUnitFt").value === "ft") {
        const feet = parseFloat(document.getElementById("feet").value) || 0;
        const inches = parseFloat(document.getElementById("inches").value) || 0;
        heightMeters = ((feet * 12) + inches) * 0.0254;
    } else {
        const h = parseFloat(document.getElementById("height").value);
        heightMeters = (singleUnit === "cm") ? h / 100 : h;
    }

    /* -- fields start empty, so validate before calculating -- */
    if (!genderInput || isNaN(ageInput) || ageInput <= 0 ||
        isNaN(weightInput) || weightInput <= 0 ||
        isNaN(heightMeters) || heightMeters <= 0) {
        bmiBox.textContent = "---";
        categoryBox.textContent = "---";
        recommendationText.textContent = "Please fill in your age, gender, weight and height first.";
        return;
    }

    const weightKg = (weightUnit === "lbs") ? weightInput * 0.453592 : weightInput;
    const bmi = calculateBMI(weightKg, heightMeters);
    const details = getDietDetails(bmi);

    currentBMICategory = details.category;
    dailyTargetKcal = estimateDailyCalories(weightKg, heightMeters * 100, ageInput, genderInput, details.category);

    bmiBox.textContent = bmi.toFixed(2);
    categoryBox.textContent = details.category;
    recommendationText.textContent = details.text;

    /* -- refresh the food gallery and pre-fill the meal rows -- */
    foodGallery.innerHTML = "";
    calorieRowsContainer.innerHTML = "";
    details.foods.forEach(item => {
        const card = document.createElement("div");
        card.className = "food-card";
        card.innerHTML = `<img src="${item.url}" alt="${item.name}"><p>${item.name}</p>`;
        foodGallery.appendChild(card);

        addFoodRow(item.name, item.calPer100g, item.defaultGrams);
    });

    calorieCardBox.classList.remove("is-hidden");
}

/* ---------- 9. Custom scroll-down choice bars -------------------------- */
/* Hides each native <select> and builds a dark themed dropdown that mirrors
   it, so the browser's white system picker never appears.                */
(function () {
    function buildCustomSelect(select) {
        if (select.classList.contains("enhanced")) return;
        select.classList.add("enhanced");

        const wrap = document.createElement("div");
        wrap.className = "cselect" + (select.classList.contains("unit-select") ? " in-group" : "");

        const trigger = document.createElement("div");
        trigger.className = "cselect-trigger";
        trigger.setAttribute("role", "button");
        trigger.setAttribute("tabindex", "0");
        trigger.innerHTML = "<span></span><i class='bx bx-chevron-down'></i>";

        const list = document.createElement("ul");
        list.className = "cselect-list";

        // keeps the visible label / highlighted option in sync with the select
        function render() {
            const opt = select.options[select.selectedIndex];
            trigger.querySelector("span").textContent = opt ? opt.text : "";
            list.querySelectorAll("li").forEach(li => {
                li.classList.toggle("selected", li.dataset.value === select.value);
            });
        }

        Array.from(select.options).forEach(opt => {
            if (opt.disabled) return;              // skip the "Select..." placeholder
            const li = document.createElement("li");
            li.textContent = opt.text;
            li.dataset.value = opt.value;
            li.addEventListener("click", e => {
                e.stopPropagation();
                select.value = opt.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                wrap.classList.remove("open");
                wrap.classList.add("just-selected");            // brief dim feedback
                window.setTimeout(() => wrap.classList.remove("just-selected"), 450);
                render();
            });
            list.appendChild(li);
        });

        trigger.addEventListener("click", e => {
            e.stopPropagation();
            const wasOpen = wrap.classList.contains("open");
            document.querySelectorAll(".cselect.open").forEach(el => el.classList.remove("open"));
            if (!wasOpen) wrap.classList.add("open");
        });
        trigger.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger.click(); }
            if (e.key === "Escape") wrap.classList.remove("open");
        });

        select.parentNode.insertBefore(wrap, select.nextSibling);
        wrap.appendChild(trigger);
        wrap.appendChild(list);
        select.addEventListener("change", render);
        select.addEventListener("cselect:sync", render);   // fired on programmatic change
        render();
    }

    // clicking anywhere else closes every open dropdown
    document.addEventListener("click", () => {
        document.querySelectorAll(".cselect.open").forEach(el => el.classList.remove("open"));
    });

    ["gender", "weightUnit", "heightUnit", "heightUnitFt"].forEach(id => {
        const el = document.getElementById(id);
        if (el) buildCustomSelect(el);
    });
})();

/* ---------- 10. Live unit conversion ------------------------------------ */
/* Converts the typed value the moment the unit choice bar changes.
   A canonical kg / cm value is stored so repeated switching never drifts. */
(function () {
    const weightInput  = document.getElementById("weight");
    const weightUnit   = document.getElementById("weightUnit");
    const heightInput  = document.getElementById("height");
    const heightUnit   = document.getElementById("heightUnit");
    const heightUnitFt = document.getElementById("heightUnitFt");
    const feet   = document.getElementById("feet");
    const inches = document.getElementById("inches");

    const LB_PER_KG = 2.2046226218;
    const round = (n, d) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

    // canonical (exact) values — NaN while the fields are still empty
    let canonicalKg = parseFloat(weightInput.value);
    let canonicalCm = parseFloat(heightInput.value);
    let weightUnitNow = weightUnit.value;
    let heightUnitNow = heightUnit.value;

    /* --- weight --- */
    weightInput.addEventListener("input", () => {
        const v = parseFloat(weightInput.value);
        canonicalKg = isNaN(v) ? NaN : (weightUnitNow === "lbs" ? v / LB_PER_KG : v);
    });

    weightUnit.addEventListener("change", () => {
        const unit = weightUnit.value;
        if (unit === weightUnitNow) return;
        weightUnitNow = unit;
        if (isNaN(canonicalKg)) return;              // nothing typed yet: stay blank
        weightInput.value = unit === "lbs"
            ? round(canonicalKg * LB_PER_KG, 1)
            : round(canonicalKg, 1);
    });

    /* --- height --- */
    function readHeightFields() {                    // -> centimetres (or NaN)
        if (heightUnitNow === "ft") {
            const f = parseFloat(feet.value);
            const i = parseFloat(inches.value);
            if (isNaN(f) && isNaN(i)) return NaN;
            return ((isNaN(f) ? 0 : f) * 12 + (isNaN(i) ? 0 : i)) * 2.54;
        }
        const v = parseFloat(heightInput.value);
        if (isNaN(v)) return NaN;
        return heightUnitNow === "m" ? v * 100 : v;
    }

    [heightInput, feet, inches].forEach(el => {
        el.addEventListener("input", () => { canonicalCm = readHeightFields(); });
    });

    function writeHeightFields(unit) {               // print canonical cm in `unit`
        if (isNaN(canonicalCm)) return;              // nothing typed yet: stay blank
        if (unit === "ft") {
            const totalIn = canonicalCm / 2.54;
            let f = Math.floor(totalIn / 12);
            let i = round(totalIn - f * 12, 1);
            if (i >= 12) { f += 1; i = 0; }
            feet.value = f;
            inches.value = i;
        } else if (unit === "m") {
            heightInput.value = round(canonicalCm / 100, 2);
        } else {
            heightInput.value = round(canonicalCm, 1);
        }
    }

    function applyHeightUnit(unit) {
        if (unit !== heightUnitNow) {
            heightUnitNow = unit;
            writeHeightFields(unit);
        }
        // keep the two height unit choosers showing the same unit
        if (heightUnit.value !== unit)   { heightUnit.value = unit;   heightUnit.dispatchEvent(new Event("cselect:sync")); }
        if (heightUnitFt.value !== unit) { heightUnitFt.value = unit; heightUnitFt.dispatchEvent(new Event("cselect:sync")); }
        toggleHeightInput();
    }

    heightUnit.addEventListener("change",   () => applyHeightUnit(heightUnit.value));
    heightUnitFt.addEventListener("change", () => applyHeightUnit(heightUnitFt.value));

    // start both choosers on the same unit (cm) so nothing is out of sync
    applyHeightUnit(heightUnit.value);
})();
