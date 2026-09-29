/**
 * EcoBite AI - MAIT Canteen Owner Student Demand Dataset
 * 
 * STRICT ARCHITECTURAL & ETHICAL STANDARDS:
 * 1. ZERO Fabricated Sales/Revenue: EcoBite does not track cash registers or sales volumes.
 * 2. ZERO Fake Physical Food Waste: EcoBite does not claim sensor-based waste kg.
 * 3. STUDENT DEMAND INTELLIGENCE: Captures real pre-purchase demand signals:
 *    - Search Queries
 *    - Smart Swap Acceptances
 *    - Smart Swap Rejections
 * 4. STRICT PRIVACY BOUNDARY: Zero Student PII. Only aggregated signals are displayed.
 */

import type { CanteenDemandItem, CanteenDemandOverview } from '../types';

export const MAIT_CANTEEN_OVERVIEW: CanteenDemandOverview = {
  campusId: 'MAIT',
  date: new Date().toISOString().split('T')[0],
  totalSignalsToday: 1042,
  totalSearchesToday: 820,
  totalSwapsAcceptedToday: 168,
  totalSwapsRejectedToday: 54,
  mostDemandedItem: 'Chole Bhature (Food Mast)',
  mostAcceptedSwap: 'Paneer Sandwich (Amul Shop)',
  mostRejectedSwap: 'Singapori Chowmein (Food Mast)',
  isDemoSample: true,
};

export const MAIT_CANTEEN_DEMAND_ITEMS: CanteenDemandItem[] = [
  {
    itemId: 'fm-003',
    name: 'Chole Bhature',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 70, // Verified MAIT price
    searchInterest: 188,
    swapAcceptedCount: 42,
    swapRejectedCount: 12,
    demandScore: 290, // (188*1) + (42*3) + (12*-2) = 188 + 126 - 24 = 290
    interestLevel: 'high',
    acceptanceStatus: 'strong',
    recommendation: 'Peak student interest. Maintain morning batch readiness for lunch rush.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'as-003',
    name: 'Paneer Sandwich',
    category: 'MEAL',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    price: 30, // Verified MAIT price
    searchInterest: 142,
    swapAcceptedCount: 76,
    swapRejectedCount: 8,
    demandScore: 354, // (142*1) + (76*3) + (8*-2) = 142 + 228 - 16 = 354
    interestLevel: 'high',
    acceptanceStatus: 'strong',
    recommendation: 'Top-performing healthy swap. High student conversion rate from fried meals.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'fm-001',
    name: 'Rajma Chawal',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 70, // Verified MAIT price
    searchInterest: 134,
    swapAcceptedCount: 68,
    swapRejectedCount: 6,
    demandScore: 326, // 134 + 204 - 12 = 326
    interestLevel: 'high',
    acceptanceStatus: 'strong',
    recommendation: 'Consistent lunch demand. Strong student acceptance as healthy whole meal.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'fm-002',
    name: 'Choley Chawal',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 70, // Verified MAIT price
    searchInterest: 98,
    swapAcceptedCount: 39,
    swapRejectedCount: 14,
    demandScore: 187, // 98 + 117 - 28 = 187
    interestLevel: 'medium',
    acceptanceStatus: 'moderate',
    recommendation: 'Steady student interest. Reliable staple for daily batch planning.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'as-001',
    name: 'Aloo Patties',
    category: 'SNACK',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    price: 20, // Verified MAIT price
    searchInterest: 112,
    swapAcceptedCount: 28,
    swapRejectedCount: 16,
    demandScore: 164, // 112 + 84 - 32 = 164
    interestLevel: 'medium',
    acceptanceStatus: 'moderate',
    recommendation: 'Frequent afternoon search queries. Students often look for quick snack options.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'as-007',
    name: 'Tea (Chai)',
    category: 'BEVERAGE',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    price: 15, // Verified MAIT price
    searchInterest: 210,
    swapAcceptedCount: 15,
    swapRejectedCount: 4,
    demandScore: 247, // 210 + 45 - 8 = 247
    interestLevel: 'high',
    acceptanceStatus: 'strong',
    recommendation: 'Highest volume beverage search on campus. On-demand brewing aligns naturally with demand.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'jp-001',
    name: 'Fresh Mosambi Juice',
    category: 'BEVERAGE',
    canteenId: 'juice-point',
    canteenName: 'Juice Point',
    price: 40, // Verified MAIT price
    searchInterest: 84,
    swapAcceptedCount: 52,
    swapRejectedCount: 5,
    demandScore: 230, // 84 + 156 - 10 = 230
    interestLevel: 'medium',
    acceptanceStatus: 'strong',
    recommendation: 'High acceptance when suggested as healthy alternative to bottled sugary drinks.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'fm-006',
    name: 'Pasta (Mix Sauce)',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 120, // Verified MAIT price
    searchInterest: 64,
    swapAcceptedCount: 18,
    swapRejectedCount: 22,
    demandScore: 74, // 64 + 54 - 44 = 74
    interestLevel: 'medium',
    acceptanceStatus: 'moderate',
    recommendation: 'Higher price point leads to some swap hesitations. Cook to order rather than pre-batching.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'fm-005',
    name: 'Singapori Chowmein',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 90, // Verified MAIT price
    searchInterest: 26,
    swapAcceptedCount: 6,
    swapRejectedCount: 18,
    demandScore: 8, // 26 + 18 - 36 = 8
    interestLevel: 'lower',
    acceptanceStatus: 'lower_acceptance',
    recommendation: 'Lowest interest meal today. Students frequently reject as alternative. Keep batch size minimal.',
    isAvailable: false,
    isDemoSample: true,
  },
];

export const CATEGORY_DEMAND_DISTRIBUTION = [
  { category: 'MEAL', label: 'Complete Meals', searchCount: 410, percentage: 50 },
  { category: 'SNACK', label: 'Snacks & Quick Bites', searchCount: 180, percentage: 22 },
  { category: 'BEVERAGE', label: 'Beverages & Juices', searchCount: 195, percentage: 24 },
  { category: 'DESSERT', label: 'Desserts & Ice Cream', searchCount: 35, percentage: 4 },
];
