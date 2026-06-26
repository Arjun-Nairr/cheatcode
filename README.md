# CheatCode 🍔

A personal calorie tracker with an on-device recommendation engine that learns your fast food preferences through feedback and time-of-day patterns — no backend required.

Built with Next.js 14, React, and the USDA FoodData Central API.

---

## Features

### Dashboard
- **Calorie ring** — visual progress toward your daily goal
- **Macro tracking** — protein, carbs, and fat vs. targets
- **7-day bar chart** — weekly intake with target reference line
- **Meal logging** — breakfast, lunch, dinner, snacks with full USDA nutrition data
- **Day streak** — consecutive days of logging
- **Adaptive message** — motivational copy that changes based on how your day is going

### Food Search
- Searches 300,000+ foods from the USDA FoodData Central database
- Smart serving picker: named unit (e.g. "1 cup"), grams, ounces — macros scale live
- Real serving sizes pulled directly from USDA (not generic "1 serving")

### Cheat Meal
- Curated fast food dataset ranked by an on-device ML scoring model
- **Learns your preferences** — thumbs up/down adjusts future rankings
- **Time-of-day learning** — tracks what hour you engage with foods and boosts them at similar times
- **Calorie gate** — warns you if you don't have the budget for a cheat meal, with an override
- **Reason chips** — explains why each item was suggested (liked, right time, fits budget)
- "Had this!" logs the item directly to your daily food diary

### Profile
- Full TDEE calculator using the Mifflin-St Jeor equation
- Configurable: age, weight, height, gender, activity level, goal (lose / maintain / gain)
- Live calorie and macro targets update as you change settings

---

## How the ML works

Every food starts with a base score of 0.5. Three signals adjust it:

| Signal | How it works |
|--------|-------------|
| **Thumbs feedback** | 👍 adds +0.1 per like (max +0.4). 👎 subtracts the same and cancels a prior like |
| **Time of day** | Logs the hour when you interact with a food. Foods get a bonus when viewed within ±2 hours of a past interaction |
| **Calorie fit** | Foods within 100 kcal of half your remaining budget get a small boost |

All weights persist across sessions in localStorage. No server, no account needed.

---

## Tech stack

- **Framework** — Next.js 14 (App Router)
- **UI** — React with inline styles, fully dark-themed
- **Charts** — Recharts
- **Data** — USDA FoodData Central API (free, no auth required)
- **Storage** — localStorage (no database)

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and set up your profile to get started.

---

## Project structure

```
app/
  page.jsx          # Dashboard
  cheat/page.jsx    # Cheat meal recommendations
  profile/page.jsx  # User profile & TDEE settings
components/
  CalorieRing.jsx   # SVG calorie ring
  MacroBars.jsx     # Macro progress bars
  WeeklyChart.jsx   # 7-day bar chart
  FoodSearch.jsx    # Food search modal + serving picker
  TopNav.jsx        # Navigation
lib/
  ml.js             # Scoring model + interaction logging
  storage.js        # localStorage helpers
  usda.js           # USDA API wrapper
  constants.js      # TDEE calculator, meal types, macros
data/
  cheatfoods.json   # Curated fast food dataset
```
