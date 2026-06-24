export const COLORS = {
  background: '#0f0f0f', card: '#1a1a1a', cardBorder: '#2a2a2a',
  accent: '#ff6b35', cheatAccent: '#a855f7',
  textPrimary: '#ffffff', textSecondary: '#9ca3af',
  protein: '#3b82f6', carbs: '#f59e0b', fat: '#ef4444', success: '#22c55e',
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
export const ACTIVITY_LABELS = {
  sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very_active: 'Very Active',
};
export const GOAL_LABELS = { lose: 'Lose Weight', maintain: 'Maintain', gain: 'Gain Weight' };

export const DEFAULT_PROFILE = {
  name: 'Arjun Nair', age: 18, gender: 'male',
  height: 170, weight: 63, goal: 'lose', activityLevel: 'moderate',
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
export const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
export const MEAL_ICONS  = { breakfast: '☀️', lunch: '🍽️', dinner: '🌙', snacks: '🍎' };

export function calculateBMR({ weight, height, age, gender }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}
export function calculateDailyCalories(profile) {
  const tdee = calculateBMR(profile) * (ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55);
  if (profile.goal === 'lose') return Math.round(tdee - 500);
  if (profile.goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
}
export function calculateMacros(dailyCalories, weight) {
  const protein = Math.round(weight * 2);
  const fat     = Math.round((dailyCalories * 0.25) / 9);
  const carbs   = Math.round((dailyCalories - protein * 4 - fat * 9) / 4);
  return { protein, fat, carbs };
}
export function calculateBMI(weight, height) {
  const hm = height / 100; return (weight / (hm * hm)).toFixed(1);
}
export function getBMICategory(bmi) {
  const b = parseFloat(bmi);
  if (b < 18.5) return 'Underweight';
  if (b < 25)   return 'Normal';
  if (b < 30)   return 'Overweight';
  return 'Obese';
}
