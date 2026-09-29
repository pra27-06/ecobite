/**
 * EcoBite AI - MAIT Canteen Owner Operational & Demand Dataset
 * 
 * STRICT ARCHITECTURAL & ETHICAL STANDARDS:
 * 1. ZERO Fabricated Pricing: Every dish price (₹) is grounded in verified MAIT menu boards.
 * 2. DEMO SAMPLE DATA TRANSPARENCY: Operational kitchen figures (prepared/sold/excess)
 *    are explicitly marked as demonstration metrics. EcoBite does not claim physical
 *    sensor-based real-time waste measurements without actual kitchen scale/POS integrations.
 * 3. STRICT PRIVACY BOUNDARY: Zero Student PII. Only aggregated campus-level demand
 *    signals (search counts, swap interest) are displayed.
 */

import type { CanteenDemandItem, CanteenOperationalOverview } from '../types';

export const MAIT_CANTEEN_OVERVIEW: CanteenOperationalOverview = {
  campusId: 'MAIT',
  date: new Date().toISOString().split('T')[0],
  totalOrders: 648,
  totalRevenueEstimate: 31450,
  mostDemandedItem: 'Chole Bhature (Food Mast)',
  lowestDemandedItem: 'Singapori Chowmein (Food Mast)',
  totalExcessMeals: 48,
  overallWastePercentage: 7.4,
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
    swapAcceptedCount: 42, // Students who accepted smart swap from this item to healthier meals
    dailyPreparedQty: 120,
    dailySoldQty: 114,
    estimatedExcessQty: 6,
    wasteRisk: 'low',
    recommendation: 'High campus demand. Maintain current preparation batch size.',
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
    swapAcceptedCount: 76, // Frequently selected as healthy swap alternative!
    dailyPreparedQty: 85,
    dailySoldQty: 83,
    estimatedExcessQty: 2,
    wasteRisk: 'low',
    recommendation: 'Top-performing healthy swap. Consider increasing morning preparation by 15%.',
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
    dailyPreparedQty: 95,
    dailySoldQty: 90,
    estimatedExcessQty: 5,
    wasteRisk: 'low',
    recommendation: 'Steady lunchtime favorite. High nutritional value with minimal waste.',
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
    dailyPreparedQty: 70,
    dailySoldQty: 65,
    estimatedExcessQty: 5,
    wasteRisk: 'low',
    recommendation: 'Balanced lunch demand. Maintain stock.',
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
    dailyPreparedQty: 80,
    dailySoldQty: 74,
    estimatedExcessQty: 6,
    wasteRisk: 'low',
    recommendation: 'Popular afternoon snack. Reheat in small batches.',
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
    dailyPreparedQty: 240,
    dailySoldQty: 235,
    estimatedExcessQty: 5,
    wasteRisk: 'low',
    recommendation: 'Highest volume beverage across campus. Fresh on-demand brewing prevents spoilage.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'jp-001',
    name: 'Fresh Mosambi Juice',
    category: 'BEVERAGE',
    canteenId: 'juice-point',
    canteenName: 'Juice Point',
    price: 40, // Verified MAIT price (Small)
    searchInterest: 84,
    swapAcceptedCount: 52,
    dailyPreparedQty: 60,
    dailySoldQty: 58,
    estimatedExcessQty: 2,
    wasteRisk: 'low',
    recommendation: 'Fresh pressed to order. Zero prepared beverage waste.',
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
    dailyPreparedQty: 40,
    dailySoldQty: 34,
    estimatedExcessQty: 6,
    wasteRisk: 'medium',
    recommendation: 'Moderate demand. Cook pasta portions upon order.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'as-009',
    name: 'Fruit Chill',
    category: 'DESSERT',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    price: 20, // Verified MAIT price
    searchInterest: 38,
    swapAcceptedCount: 4,
    dailyPreparedQty: 30,
    dailySoldQty: 25,
    estimatedExcessQty: 5,
    wasteRisk: 'low',
    recommendation: 'Packaged freezer item. Extended shelf-life; no immediate waste risk.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'fm-011',
    name: 'Singapori Chowmein',
    category: 'MEAL',
    canteenId: 'food-mast',
    canteenName: 'Food Mast',
    price: 120, // Verified MAIT price
    searchInterest: 26,
    swapAcceptedCount: 8,
    dailyPreparedQty: 45,
    dailySoldQty: 22,
    estimatedExcessQty: 23,
    wasteRisk: 'high',
    recommendation: 'Low student demand with high excess. Consider reducing daily prep batch by 30%.',
    isAvailable: true,
    isDemoSample: true,
  },
  {
    itemId: 'as-014',
    name: 'Spiral Potato',
    category: 'SNACK',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    price: 50, // Verified MAIT price
    searchInterest: 32,
    swapAcceptedCount: 6,
    dailyPreparedQty: 35,
    dailySoldQty: 18,
    estimatedExcessQty: 17,
    wasteRisk: 'high',
    recommendation: 'Low re-heat tolerance. Prepare skewered potatoes strictly on-demand.',
    isAvailable: true,
    isDemoSample: true,
  },
];

/**
 * Aggregated category demand distribution
 */
export const CATEGORY_DEMAND_DISTRIBUTION = [
  { category: 'MEAL', label: 'Meals (North Indian / Chinese)', percentage: 46, orderVolume: 298 },
  { category: 'SNACK', label: 'Snacks (Patties / Fries / Momos)', percentage: 24, orderVolume: 156 },
  { category: 'BEVERAGE', label: 'Beverages (Tea / Coffee / Juices)', percentage: 23, orderVolume: 149 },
  { category: 'DESSERT', label: 'Desserts & Ice Confections', percentage: 7, orderVolume: 45 },
];
