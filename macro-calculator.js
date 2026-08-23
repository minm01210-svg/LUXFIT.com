const activityMultipliers = {
    sedentary: { value: 1.2, label: 'Sedentary (desk job, little exercise)' },
    light: { value: 1.375, label: 'Light (1–3 workouts per week)' },
    moderate: { value: 1.55, label: 'Moderate (3–5 workouts per week)' },
    active: { value: 1.725, label: 'Active (6–7 workouts per week)' },
    veryActive: { value: 1.9, label: 'Very Active (athlete / physical job)' },
};

const goalSettings = {
    lose: {
        label: 'Lose Fat',
        calorieOffset: -500,
        proteinPerKg: 2.2,
        fatPercent: 0.25,
        tip: 'High protein helps preserve muscle while you cut. Aim for a steady 0.5 kg loss per week.',
    },
    maintain: {
        label: 'Maintain',
        calorieOffset: 0,
        proteinPerKg: 1.8,
        fatPercent: 0.3,
        tip: 'Balanced macros to keep energy stable and support your current training load.',
    },
    gain: {
        label: 'Build Muscle',
        calorieOffset: 300,
        proteinPerKg: 1.6,
        fatPercent: 0.25,
        tip: 'A moderate surplus fuels muscle growth without excessive fat gain.',
    },
};

let selectedGoal = 'maintain';
let selectedMeals = 4;

function getWeightKg() {
    const weight = parseFloat(document.getElementById('macro-weight').value);
    const unit = document.getElementById('macro-weight-unit').value;
    if (isNaN(weight) || weight <= 0) return null;
    return unit === 'lbs' ? weight * 0.453592 : weight;
}

function getHeightCm() {
    const unit = document.getElementById('macro-height-unit').value;

    if (unit === 'ft') {
        const feet = parseFloat(document.getElementById('macro-feet').value) || 0;
        const inches = parseFloat(document.getElementById('macro-inches').value) || 0;
        if (feet <= 0 && inches <= 0) return null;
        return ((feet * 12) + inches) * 2.54;
    }

    const height = parseFloat(document.getElementById('macro-height').value);
    if (isNaN(height) || height <= 0) return null;
    return unit === 'm' ? height * 100 : height;
}

function toggleHeightFields() {
    const unit = document.getElementById('macro-height-unit').value;
    const singleGroup = document.getElementById('macro-single-height');
    const feetGroup = document.getElementById('macro-feet-height');

    if (unit === 'ft') {
        singleGroup.style.display = 'none';
        feetGroup.style.display = 'flex';
    } else {
        singleGroup.style.display = 'flex';
        feetGroup.style.display = 'none';
    }
}

function calculateBMR(weightKg, heightCm, age, gender) {
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

    if (gender === 'female') return base - 161;
    if (gender === 'male') return base + 5;
    return base - 78;
}

function calculateMacros() {
    const age = parseInt(document.getElementById('macro-age').value, 10);
    const gender = document.getElementById('macro-gender').value;
    const activity = document.getElementById('macro-activity').value;
    const weightKg = getWeightKg();
    const heightCm = getHeightCm();

    if (isNaN(age) || age <= 0) {
        alert('Please enter a valid age.');
        return;
    }

    if (!weightKg) {
        alert('Please enter a valid weight.');
        return;
    }

    if (!heightCm) {
        alert('Please enter a valid height.');
        return;
    }

    const goal = goalSettings[selectedGoal];
    const multiplier = activityMultipliers[activity].value;
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = Math.round(bmr * multiplier);
    const targetCalories = Math.max(1200, tdee + goal.calorieOffset);

    const proteinGrams = Math.round(weightKg * goal.proteinPerKg);
    const proteinCalories = proteinGrams * 4;

    const fatCalories = Math.round(targetCalories * goal.fatPercent);
    const fatGrams = Math.round(fatCalories / 9);

    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbGrams = Math.round(carbCalories / 4);

    const totalMacroCalories = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9);
    const proteinShare = Math.round(((proteinGrams * 4) / totalMacroCalories) * 100);
    const carbShare = Math.round(((carbGrams * 4) / totalMacroCalories) * 100);
    const fatShare = Math.round(((fatGrams * 9) / totalMacroCalories) * 100);

    document.getElementById('macro-summary').innerHTML = `
        <h4>Your Daily Targets</h4>
        <p><strong>BMR:</strong> ${Math.round(bmr)} kcal · <strong>TDEE:</strong> ${tdee} kcal</p>
        <p><strong>Goal:</strong> ${goal.label} · <strong>Target Intake:</strong> ${targetCalories} kcal/day</p>
        <p>${goal.tip}</p>
    `;

    document.getElementById('macro-results').innerHTML = `
        <div class="macro-stat protein">
            <span class="macro-label">Protein</span>
            <span class="macro-value">${proteinGrams}g</span>
            <span class="macro-percent">${proteinShare}% · ${proteinGrams * 4} kcal</span>
        </div>
        <div class="macro-stat carbs">
            <span class="macro-label">Carbs</span>
            <span class="macro-value">${carbGrams}g</span>
            <span class="macro-percent">${carbShare}% · ${carbGrams * 4} kcal</span>
        </div>
        <div class="macro-stat fats">
            <span class="macro-label">Fats</span>
            <span class="macro-value">${fatGrams}g</span>
            <span class="macro-percent">${fatShare}% · ${fatGrams * 9} kcal</span>
        </div>
    `;

    const perMealProtein = Math.round(proteinGrams / selectedMeals);
    const perMealCarbs = Math.round(carbGrams / selectedMeals);
    const perMealFats = Math.round(fatGrams / selectedMeals);
    const perMealCalories = Math.round(targetCalories / selectedMeals);

    document.getElementById('meal-split').innerHTML = `
        <h4>Per Meal (${selectedMeals} meals/day)</h4>
        <p><strong>Calories:</strong> ~${perMealCalories} kcal</p>
        <p><strong>Protein:</strong> ~${perMealProtein}g · <strong>Carbs:</strong> ~${perMealCarbs}g · <strong>Fats:</strong> ~${perMealFats}g</p>
    `;
}

function setGoal(goal) {
    selectedGoal = goal;
    document.querySelectorAll('.goal-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.goal === goal);
    });
}

function setMeals(meals) {
    selectedMeals = meals;
    document.querySelectorAll('.meal-btn').forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.dataset.meals, 10) === meals);
    });
}

document.querySelectorAll('.goal-btn').forEach((btn) => {
    btn.addEventListener('click', () => setGoal(btn.dataset.goal));
});

document.querySelectorAll('.meal-btn').forEach((btn) => {
    btn.addEventListener('click', () => setMeals(parseInt(btn.dataset.meals, 10)));
});

document.getElementById('macro-height-unit').addEventListener('change', toggleHeightFields);
document.getElementById('calculate-macros').addEventListener('click', calculateMacros);

toggleHeightFields();
setGoal('maintain');
setMeals(4);
