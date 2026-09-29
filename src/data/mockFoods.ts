/**
 * EcoBite AI - Mock / Demo Food Data
 * 
 * IMPORTANT:
 * These values are UI/demo mock values for the prototype frontend.
 * In production, verified campus menu items and prices will be retrieved from Cloud Firestore,
 * and nutritional/sustainability analysis will be reasoned by Gemini AI.
 */

export interface MockFoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Breakfast' | 'Meals' | 'Snacks' | 'Beverages';
  emoji: string;
  description: string;
  scores: {
    body: number; // 0 - 10 (Health)
    wallet: number; // 0 - 10 (Affordability)
    planet: number; // 0 - 10 (Sustainability)
  };
  nutrition: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
  };
  whyScore: {
    body: string;
    wallet: string;
    planet: string;
  };
  defaultSwapId?: string;
}

export const MOCK_FOODS: MockFoodItem[] = [
  {
    id: 'chole-bhature',
    name: 'Chole Bhature',
    hindiName: 'छोले भटूरे',
    category: 'Meals',
    emoji: '🍛',
    description: 'Deep-fried leavened sourdough bread (bhatura) served with spicy chickpea curry (chole).',
    scores: {
      body: 4.5,
      wallet: 7.5,
      planet: 6.0,
    },
    nutrition: {
      calories: 540,
      protein: 12,
      carbs: 68,
      fat: 26,
    },
    whyScore: {
      body: 'High saturated and trans-fat content from deep frying; causes post-lunch lethargy.',
      wallet: 'Decently priced for portion volume, but often leads to mid-afternoon snack cravings.',
      planet: 'Moderate carbon footprint; mostly plant-based chickpeas but high oil and energy use in frying.',
    },
    defaultSwapId: 'dal-tadka',
  },
  {
    id: 'paneer-sandwich',
    name: 'Paneer Sandwich',
    hindiName: 'पनीर सैंडविच',
    category: 'Snacks',
    emoji: '🥪',
    description: 'Grilled whole-wheat or multi-grain sandwich packed with spiced fresh cottage cheese (paneer).',
    scores: {
      body: 7.8,
      wallet: 8.5,
      planet: 7.2,
    },
    nutrition: {
      calories: 290,
      protein: 16,
      carbs: 32,
      fat: 10,
    },
    whyScore: {
      body: 'Rich in lean vegetarian protein and complex carbohydrates; keeps you satiated for hours.',
      wallet: 'High protein-to-cost ratio, making it an optimal budget pick for college students.',
      planet: 'Lower preparation emissions compared to processed meats, moderate dairy footprint.',
    },
    defaultSwapId: 'paneer-sandwich',
  },
  {
    id: 'rajma-chawal',
    name: 'Rajma Chawal',
    hindiName: 'राजमा चावल',
    category: 'Meals',
    emoji: '🍲',
    description: 'Steamed basmati rice served with slow-cooked red kidney beans in aromatic tomato-onion gravy.',
    scores: {
      body: 8.4,
      wallet: 9.0,
      planet: 8.5,
    },
    nutrition: {
      calories: 380,
      protein: 15,
      carbs: 64,
      fat: 6,
    },
    whyScore: {
      body: 'Complete amino acid profile when beans and rice combine; rich in dietary fiber.',
      wallet: 'One of the most economical, nutrient-dense lunch options available in college canteens.',
      planet: 'Legume cultivation fixes soil nitrogen, requiring low chemical inputs and minimal emissions.',
    },
    defaultSwapId: 'rajma-chawal',
  },
  {
    id: 'masala-maggi',
    name: 'Masala Maggi',
    hindiName: 'मसाला मैगी',
    category: 'Snacks',
    emoji: '🍜',
    description: 'Instant noodles cooked with spice tastemaker, vegetables, and oil.',
    scores: {
      body: 3.5,
      wallet: 9.5,
      planet: 5.5,
    },
    nutrition: {
      calories: 320,
      protein: 6,
      carbs: 48,
      fat: 13,
    },
    whyScore: {
      body: 'High in sodium and refined flour (maida) with negligible dietary fiber or quality protein.',
      wallet: 'Extremely pocket-friendly, which makes it an addictive staple despite nutritional deficits.',
      planet: 'Multi-layer plastic packaging and refined palm oil production impact the environmental score.',
    },
    defaultSwapId: 'paneer-sandwich',
  },
  {
    id: 'veg-burger',
    name: 'Veg Burger',
    hindiName: 'वेज बर्गर',
    category: 'Snacks',
    emoji: '🍔',
    description: 'Deep-fried potato patty inside a refined white bun with mayo and cabbage shred.',
    scores: {
      body: 5.0,
      wallet: 7.5,
      planet: 6.2,
    },
    nutrition: {
      calories: 420,
      protein: 8,
      carbs: 54,
      fat: 19,
    },
    whyScore: {
      body: 'High refined carbs and high oil absorption from the fried potato patty.',
      wallet: 'Moderate price, but offers low satiety compared to whole grain canteen meals.',
      planet: 'Processed frozen patty distribution and single-use wrappers increase footprint.',
    },
    defaultSwapId: 'paneer-sandwich',
  },
  {
    id: 'dal-tadka',
    name: 'Dal Tadka + 2 Roti + Curd',
    hindiName: 'दाल तड़का + रोटी + दही',
    category: 'Meals',
    emoji: '🥣',
    description: 'Yellow lentil stew tempered with cumin and garlic, served with whole-wheat rotis and fresh curd.',
    scores: {
      body: 8.8,
      wallet: 9.0,
      planet: 8.8,
    },
    nutrition: {
      calories: 360,
      protein: 17,
      carbs: 52,
      fat: 8,
    },
    whyScore: {
      body: 'Optimal balance of plant protein, complex wheat fiber, and gut-healthy probiotics.',
      wallet: 'Standard subsidised college canteen thali rate offering complete nutritional coverage.',
      planet: 'Lowest carbon footprint of common canteen meals; locally sourced grains and pulses.',
    },
    defaultSwapId: 'dal-tadka',
  },
  {
    id: 'chole-chawal',
    name: 'Chole Chawal',
    hindiName: 'छोले चावल',
    category: 'Meals',
    emoji: '🍛',
    description: 'Steamed rice served with mildly spiced chickpea curry and onion salad.',
    scores: {
      body: 7.5,
      wallet: 9.0,
      planet: 8.0,
    },
    nutrition: {
      calories: 410,
      protein: 13,
      carbs: 65,
      fat: 7,
    },
    whyScore: {
      body: 'Good plant protein and energy, much healthier than deep-fried bhaturas.',
      wallet: 'Affordable staple meal readily available across student counters.',
      planet: 'Plant-forward meal with minimal packaging and low processing requirements.',
    },
    defaultSwapId: 'rajma-chawal',
  },
  {
    id: 'pav-bhaji',
    name: 'Pav Bhaji',
    hindiName: 'पाव भाजी',
    category: 'Snacks',
    emoji: '🧈',
    description: 'Spiced mashed mixed vegetable gravy cooked with butter, served with toasted pav rolls.',
    scores: {
      body: 5.6,
      wallet: 8.0,
      planet: 6.8,
    },
    nutrition: {
      calories: 460,
      protein: 9,
      carbs: 58,
      fat: 21,
    },
    whyScore: {
      body: 'Vegetable diversity is beneficial, but excessive butter and refined pav lower overall health value.',
      wallet: 'Reasonable price for filling snack, though heavy in saturated dairy fats.',
      planet: 'Moderate impact; uses mostly seasonal vegetables with dairy butter.',
    },
    defaultSwapId: 'dal-tadka',
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    hindiName: 'कोल्ड कॉफी',
    category: 'Beverages',
    emoji: '🥤',
    description: 'Chilled blended milk with instant coffee, ice, and added refined sugar or chocolate syrup.',
    scores: {
      body: 4.2,
      wallet: 7.0,
      planet: 6.0,
    },
    nutrition: {
      calories: 250,
      protein: 5,
      carbs: 36,
      fat: 9,
    },
    whyScore: {
      body: 'High refined sugar spike followed by rapid energy crash during study sessions.',
      wallet: 'Often priced at a premium compared to traditional canteen chai or fresh buttermilk.',
      planet: 'Chilled storage electricity and disposable plastic cups increase total footprint.',
    },
    defaultSwapId: 'paneer-sandwich',
  },
];

export function getMockFoodById(id: string): MockFoodItem | undefined {
  return MOCK_FOODS.find((f) => f.id === id);
}

export function searchMockFoods(query: string): MockFoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_FOODS;
  return MOCK_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.hindiName && f.hindiName.includes(q)) ||
      f.category.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
  );
}
