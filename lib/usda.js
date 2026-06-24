const API_KEY = 'DEMO_KEY';
const BASE = 'https://api.nal.usda.gov/fdc/v1';

function extractNutrient(nutrients, id) {
  const n = nutrients.find((x) => x.nutrientId === id || x.nutrientNumber === String(id));
  return n ? Math.round(n.value ?? 0) : 0;
}

export async function searchFoods(query) {
  if (!query.trim()) return [];
  const params = new URLSearchParams({ query: query.trim(), pageSize: '20', api_key: API_KEY });
  const res = await fetch(`${BASE}/foods/search?${params}`);
  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
  const data = await res.json();
  return (data.foods ?? [])
    .map((food) => {
      const servingSize = food.servingSize ?? null;
      const servingUnit = food.servingSizeUnit ?? food.householdServingFullText ?? null;
      const servingLabel = servingSize && servingUnit
        ? `${servingSize}${servingUnit}`
        : (food.householdServingFullText ?? null);
      return {
        id: String(food.fdcId),
        name: food.description,
        brand: food.brandOwner ?? food.brandName ?? null,
        calories: extractNutrient(food.foodNutrients ?? [], 1008),
        protein:  extractNutrient(food.foodNutrients ?? [], 1003),
        carbs:    extractNutrient(food.foodNutrients ?? [], 1005),
        fat:      extractNutrient(food.foodNutrients ?? [], 1004),
        servingLabel,
      };
    })
    .filter((f) => f.calories > 0);
}
