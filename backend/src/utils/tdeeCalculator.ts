/**
 * TDEE (Total Daily Energy Expenditure) Calculator
 * Automatically calculates daily caloric needs based on biometric data and activity level.
 * Implements Harris-Benedict equation (1919) - industry standard for caloric estimation.
 */

export interface BiometricProfile {
  weight: number; // kg
  height: number; // cm
  age: number; // years
  gender: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}

/**
 * Activity Level Multipliers (Harris-Benedict)
 * - Sedentary: Little or no exercise, desk job
 * - Light: Light exercise 1-3 days per week
 * - Moderate: Moderate exercise 3-5 days per week
 * - Active: Heavy exercise 6-7 days per week
 * - Very Active: Very heavy exercise or physical job
 */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Harris-Benedict equation
 * BMR: calories burned at complete rest
 */
export const calculateBMR = (profile: BiometricProfile): number => {
  const { weight, height, age, gender } = profile;

  if (gender === 'male') {
    // BMR = 88.362 + (13.397 * weight in kg) + (4.799 * height in cm) - (5.677 * age in years)
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    // BMR = 447.593 + (9.247 * weight in kg) + (3.098 * height in cm) - (4.330 * age in years)
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR x Activity Multiplier
 * This is the daily caloric intake (approximately) for weight maintenance.
 */
export const calculateTDEE = (profile: BiometricProfile): number => {
  const { activityLevel = 'moderate' } = profile;
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate recommended daily caloric goals based on fitness objective
 * @param tdee Total Daily Energy Expenditure (maintenance calories)
 * @param goal 'weightLoss' | 'weightGain' | 'maintenance'
 * @returns Daily caloric intake recommendation
 */
export const calculateCaloricGoal = (
  tdee: number,
  goal: 'weightLoss' | 'weightGain' | 'maintenance' = 'maintenance'
): number => {
  const CALORIC_DEFICIT_LOSS = 0.85; // 15% deficit = ~0.5 kg/week loss
  const CALORIC_SURPLUS_GAIN = 1.1; // 10% surplus = ~0.5 kg/week gain

  switch (goal) {
    case 'weightLoss':
      return Math.round(tdee * CALORIC_DEFICIT_LOSS);
    case 'weightGain':
      return Math.round(tdee * CALORIC_SURPLUS_GAIN);
    default:
      return tdee;
  }
};

/**
 * Calculate macronutrient targets based on caloric goal
 * Uses standard ratios: Protein 30%, Carbs 40%, Fat 30%
 * Protein prioritized for muscle retention during weight loss
 */
export const calculateMacroTargets = (
  caloricGoal: number,
  goal: 'weightLoss' | 'weightGain' | 'maintenance' = 'maintenance'
): {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
} => {
  let proteinRatio = 0.3; // 30% default
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  // Adjust macros for goal
  if (goal === 'weightLoss') {
    proteinRatio = 0.35; // Higher protein to preserve muscle
    carbsRatio = 0.35;
    fatRatio = 0.3;
  } else if (goal === 'weightGain') {
    proteinRatio = 0.3; // Adequate for muscle building
    carbsRatio = 0.45; // Higher carbs for energy and muscle glycogen
    fatRatio = 0.25;
  }

  return {
    protein: Math.round((caloricGoal * proteinRatio) / 4), // 4 cal/g
    carbs: Math.round((caloricGoal * carbsRatio) / 4), // 4 cal/g
    fat: Math.round((caloricGoal * fatRatio) / 9), // 9 cal/g
  };
};

/**
 * Comprehensive calculation: Biometrics -> TDEE -> Caloric Goal -> Macro Targets
 */
export const generateNutritionPlan = (
  profile: BiometricProfile,
  goal: 'weightLoss' | 'weightGain' | 'maintenance' = 'maintenance'
) => {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const caloricGoal = calculateCaloricGoal(tdee, goal);
  const macros = calculateMacroTargets(caloricGoal, goal);

  return {
    bmr: Math.round(bmr),
    tdee,
    caloricGoal,
    macros,
    goal,
    profile,
  };
};
