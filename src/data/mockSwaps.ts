/**
 * EcoBite AI - Mock Smart Swap Recommendations
 * 
 * IMPORTANT:
 * In production, the recommendation engine queries verified Cloud Firestore menu items
 * for the student's campus and uses Gemini AI to reason out the optimal swap.
 * These are mock demo mappings for the frontend prototype.
 */

export interface MockSwapDetails {
  id: string;
  sourceFoodId: string;
  sourceFoodName: string;
  sourceFoodEmoji: string;
  targetFoodId: string;
  targetFoodName: string;
  targetFoodEmoji: string;
  canteenLocation: string; // e.g. "Main Canteen - Counter 2"
  benchmarks: {
    health: { current: string; recommended: string; improvement: string };
    price: { current: number; recommended: number }; // In INR (₹)
    sustainability: { current: string; recommended: string };
    protein: { current: string; recommended: string };
  };
  moneySaved: number; // In INR (₹)
  whyReasons: string[];
}

export const MOCK_SWAPS: Record<string, MockSwapDetails> = {
  'chole-bhature': {
    id: 'swap-chole-to-dal-thali',
    sourceFoodId: 'chole-bhature',
    sourceFoodName: 'Chole Bhature',
    sourceFoodEmoji: '🍛',
    targetFoodId: 'dal-tadka',
    targetFoodName: 'Dal Tadka + 2 Roti + Curd',
    targetFoodEmoji: '🥣',
    canteenLocation: 'MAIT Main Canteen (Thali Counter)',
    benchmarks: {
      health: { current: '4.5 / 10', recommended: '8.8 / 10', improvement: '+4.3' },
      price: { current: 70, recommended: 50 },
      sustainability: { current: '6.0 / 10', recommended: '8.8 / 10' },
      protein: { current: '12g', recommended: '17g' },
    },
    moneySaved: 20,
    whyReasons: [
      'Better protein balance: 17g whole protein with zero deep-fried trans-fats',
      'Lower post-meal fatigue: Complex carbohydrates keep you alert for afternoon labs',
      'Lower cost: Saves ₹20 per meal without sacrificing satiety',
      'Lower estimated carbon & water footprint from whole local legumes',
    ],
  },
  'masala-maggi': {
    id: 'swap-maggi-to-paneer-sandwich',
    sourceFoodId: 'masala-maggi',
    sourceFoodName: 'Masala Maggi',
    sourceFoodEmoji: '🍜',
    targetFoodId: 'paneer-sandwich',
    targetFoodName: 'Paneer Sandwich',
    targetFoodEmoji: '🥪',
    canteenLocation: 'MAIT Nescafe & Snack Booth',
    benchmarks: {
      health: { current: '3.5 / 10', recommended: '7.8 / 10', improvement: '+4.3' },
      price: { current: 35, recommended: 30 },
      sustainability: { current: '5.5 / 10', recommended: '7.2 / 10' },
      protein: { current: '6g', recommended: '16g' },
    },
    moneySaved: 5,
    whyReasons: [
      'Almost 3x protein content: 16g vs 6g in instant noodles',
      'Eliminates refined palm oil and excessive sodium tastemaker',
      'Affordable: Keeps you full for hours through high-quality cottage cheese',
      'Reduced plastic packaging and processed food transport impact',
    ],
  },
  'veg-burger': {
    id: 'swap-burger-to-paneer-sandwich',
    sourceFoodId: 'veg-burger',
    sourceFoodName: 'Veg Burger',
    sourceFoodEmoji: '🍔',
    targetFoodId: 'paneer-sandwich',
    targetFoodName: 'Paneer Sandwich',
    targetFoodEmoji: '🥪',
    canteenLocation: 'MAIT Nescafe & Snack Booth',
    benchmarks: {
      health: { current: '5.0 / 10', recommended: '7.8 / 10', improvement: '+2.8' },
      price: { current: 45, recommended: 30 },
      sustainability: { current: '6.2 / 10', recommended: '7.2 / 10' },
      protein: { current: '9g', recommended: '16g' },
    },
    moneySaved: 15,
    whyReasons: [
      'Cuts out fried potato patty oil absorption',
      'Double the protein density at a lower price point',
      'Saves ₹15 while providing longer-lasting energy for study sessions',
    ],
  },
};

export const DEFAULT_MOCK_SWAP: MockSwapDetails = MOCK_SWAPS['chole-bhature'];

export function getMockSwapForFood(foodId: string): MockSwapDetails {
  return MOCK_SWAPS[foodId] || DEFAULT_MOCK_SWAP;
}
