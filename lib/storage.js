'use client';
import { DEFAULT_PROFILE } from './constants';

const K = {
  PROFILE: 'cd_profile',
  LOG: 'cd_log_',
  ML_WEIGHTS: 'cd_ml_weights',
  ML_INTERACTIONS: 'cd_ml_interactions',
};

const isClient = () => typeof window !== 'undefined';

export function dateToKey(date) {
  if (typeof date === 'string') return date.split('T')[0];
  return date.toISOString().split('T')[0];
}
export const todayKey = () => dateToKey(new Date());

export function getUserProfile() {
  if (!isClient()) return { ...DEFAULT_PROFILE };
  try {
    const raw = localStorage.getItem(K.PROFILE);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
  } catch { return { ...DEFAULT_PROFILE }; }
}
export function saveUserProfile(profile) {
  if (!isClient()) return;
  localStorage.setItem(K.PROFILE, JSON.stringify(profile));
}

const emptyLog = () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] });
export function getLog(dk) {
  if (!isClient()) return emptyLog();
  try {
    const raw = localStorage.getItem(K.LOG + dk);
    return raw ? { ...emptyLog(), ...JSON.parse(raw) } : emptyLog();
  } catch { return emptyLog(); }
}
export function saveLog(dk, log) {
  if (!isClient()) return;
  localStorage.setItem(K.LOG + dk, JSON.stringify(log));
}

export function getMLWeights() {
  if (!isClient()) return {};
  try { const r = localStorage.getItem(K.ML_WEIGHTS); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
export function saveMLWeights(w) {
  if (!isClient()) return;
  localStorage.setItem(K.ML_WEIGHTS, JSON.stringify(w));
}
export function getMLInteractions() {
  if (!isClient()) return [];
  try { const r = localStorage.getItem(K.ML_INTERACTIONS); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
export function saveMLInteractions(i) {
  if (!isClient()) return;
  localStorage.setItem(K.ML_INTERACTIONS, JSON.stringify(i));
}

export function getTrackingStreak() {
  if (!isClient()) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const dk = dateToKey(d);
    const log = getLog(dk);
    const hasFood = Object.values(log).flat().length > 0;
    if (!hasFood) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getCheatHistory() {
  if (!isClient()) return [];
  try { const r = localStorage.getItem('cd_cheat_history'); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
export function addCheatEntry(food) {
  if (!isClient()) return;
  const history = getCheatHistory();
  const entry = { ...food, date: dateToKey(new Date()), ts: Date.now() };
  localStorage.setItem('cd_cheat_history', JSON.stringify([entry, ...history].slice(0, 50)));
}
