import cheatFoods from '../data/cheatfoods.json';
import { getMLWeights, saveMLWeights, getMLInteractions, saveMLInteractions } from './storage';

export { cheatFoods };

function scoreFood(food, weights, interactions, { remainingCalories, hour }) {
  const w = weights[food.id] || {};
  let score = 0.5;
  const reasons = [];

  const thumbsUpBonus = Math.min((w.thumbsUp || 0) * 0.1, 0.4);
  if (thumbsUpBonus > 0) { score += thumbsUpBonus; reasons.push('liked'); }
  score -= Math.min((w.thumbsDown || 0) * 0.1, 0.4);

  const hourMatches = interactions.filter(
    (i) => i.foodId === food.id && Math.abs(i.hour - hour) <= 2
  ).length;
  const timeBonus = Math.min(hourMatches * 0.05, 0.2);
  if (timeBonus > 0) { score += timeBonus; reasons.push('time'); }

  const calorieFit = Math.abs(food.calories - remainingCalories * 0.5) < 100;
  if (calorieFit) { score += 0.1; reasons.push('budget'); }

  return { score: Math.max(0, Math.min(1, score)), reasons };
}

export function getSuggestions(context) {
  const weights = getMLWeights();
  const interactions = getMLInteractions();
  const eligible = cheatFoods.filter((f) => f.calories <= context.remainingCalories - 50);
  if (!eligible.length) return [];
  return eligible
    .map((f) => { const { score, reasons } = scoreFood(f, weights, interactions, context); return { ...f, score, reasons }; })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function logInteraction(foodId, action, context = {}) {
  const hour = context.hour ?? new Date().getHours();
  const weights = getMLWeights();
  const interactions = getMLInteractions();
  const w = { clicks: 0, thumbsUp: 0, thumbsDown: 0, ...(weights[foodId] || {}) };
  if (action === 'click')           w.clicks     += 1;
  else if (action === 'thumbsup')   { w.thumbsUp  += 1; w.thumbsDown = Math.max(0, w.thumbsDown - 1); }
  else if (action === 'thumbsdown') { w.thumbsDown += 1; w.thumbsUp  = Math.max(0, w.thumbsUp   - 1); }
  weights[foodId] = w;
  const trimmed = [...interactions, { foodId, action, hour, ts: Date.now() }].slice(-500);
  saveMLWeights(weights);
  saveMLInteractions(trimmed);
}
