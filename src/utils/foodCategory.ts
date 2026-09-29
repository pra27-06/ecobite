/**
 * EcoBite AI - Canonical Food Category Classification
 * 
 * Strict architectural rule:
 * Smart Swaps MUST respect food categories (like-for-like):
 * - MEAL -> MEAL
 * - SNACK -> SNACK
 * - BEVERAGE -> BEVERAGE
 * - DESSERT -> DESSERT
 * 
 * Prevents nonsensical cross-category recommendations like:
 * - Chole Bhature (Meal) -> Fruit Chill (Dessert) [FORBIDDEN]
 * - Paneer Sandwich (Meal) -> Tea (Beverage) [FORBIDDEN]
 */

import type { FoodCategory } from '../types';

/**
 * Determine canonical FoodCategory from item name and optional raw category string.
 */
export function classifyFoodCategory(name: string, rawCategory?: string): FoodCategory {
  const n = (name || '').toLowerCase().trim();
  const c = (rawCategory || '').toLowerCase().trim();

  // 1. BEVERAGES (Check shakes first so "Brownie Shake" is categorized as BEVERAGE, not DESSERT)
  if (
    n.includes('shake') ||
    n.includes('tea') ||
    n.includes('chai') ||
    n.includes('coffee') ||
    n.includes('juice') ||
    n.includes('lassi') ||
    n.includes('mojito') ||
    n.includes('soda') ||
    n.includes('frappe') ||
    n.includes('chaas') ||
    n.includes('buttermilk') ||
    n.includes('nimbu pani') ||
    n.includes('water') ||
    c === 'beverages' ||
    c === 'tea' ||
    c === 'coffee' ||
    c === 'shakes' ||
    c === 'juices'
  ) {
    // Exception: "Fruit Chill" is an Amul branded ice-confection/dessert bar, NOT a beverage meal replacement
    if (n === 'fruit chill' || n.includes('fruit chill')) {
      return 'DESSERT';
    }
    return 'BEVERAGE';
  }

  // 2. DESSERTS
  if (
    n.includes('fruit chill') ||
    n.includes('brownie') ||
    n.includes('ice cream') ||
    n.includes('icecream') ||
    n.includes('kulfi') ||
    n.includes('pastry') ||
    n.includes('gulab jamun') ||
    n.includes('rasgulla') ||
    n.includes('halwa') ||
    n.includes('dessert') ||
    c === 'desserts' ||
    c === 'dessert'
  ) {
    return 'DESSERT';
  }

  // 3. SNACKS (Finger foods, fried savory bites, pastries, appetizers)
  if (
    n.includes('patties') ||
    n.includes('patie') ||
    n.includes('puff') ||
    n.includes('fries') ||
    n.includes('french fries') ||
    n.includes('spring roll') ||
    n.includes('momos') ||
    n.includes('momo') ||
    n.includes('samosa') ||
    n.includes('spiral potato') ||
    n.includes('bread pakora') ||
    n.includes('pakoda') ||
    n.includes('bhel') ||
    n.includes('kachori') ||
    n.includes('chaat') ||
    c === 'snacks' ||
    c === 'sides'
  ) {
    // Exceptions: Large flatbread or meal-like snacks classified as meals
    if (n.includes('sandwich') || n.includes('burger') || n.includes('kulcha') || n.includes('wada')) {
      return 'MEAL';
    }
    return 'SNACK';
  }

  // 4. MEALS (Core substantial foods: Rice bowls, curries, sandwiches, noodles, pasta, burgers)
  if (
    n.includes('chawal') ||
    n.includes('rice') ||
    n.includes('bhature') ||
    n.includes('bhatura') ||
    n.includes('rajma') ||
    n.includes('choley') ||
    n.includes('chole') ||
    n.includes('pav bhaji') ||
    n.includes('kulcha') ||
    n.includes('sandwich') ||
    n.includes('pasta') ||
    n.includes('penne') ||
    n.includes('chowmein') ||
    n.includes('noodles') ||
    n.includes('noodle') ||
    n.includes('maggi') ||
    n.includes('maggie') ||
    n.includes('burger') ||
    n.includes('hot dog') ||
    n.includes('manchurian') ||
    n.includes('samber') ||
    n.includes('wada') ||
    n.includes('dosa') ||
    n.includes('idli') ||
    n.includes('dal') ||
    n.includes('roti') ||
    n.includes('thali') ||
    c === 'meals' ||
    c === 'indian-meals' ||
    c === 'sandwiches' ||
    c === 'fast food' ||
    c === 'chinese' ||
    c === 'chinese meals' ||
    c === 'quick bites' ||
    c === 'south indian' ||
    c === 'burgers' ||
    c === 'maggi'
  ) {
    return 'MEAL';
  }

  // Default fallback based on rawCategory or general assumption
  if (c.includes('meal') || c.includes('lunch') || c.includes('dinner')) return 'MEAL';
  if (c.includes('snack')) return 'SNACK';
  if (c.includes('drink') || c.includes('beverage')) return 'BEVERAGE';
  if (c.includes('sweet') || c.includes('dessert')) return 'DESSERT';

  return 'MEAL';
}

/**
 * Returns human-readable label and badge color for a FoodCategory
 */
export function getCategoryBadgeProps(category: FoodCategory): { label: string; bgClass: string; textClass: string } {
  switch (category) {
    case 'MEAL':
      return { label: 'Meal', bgClass: 'bg-indigo-50 border-indigo-200', textClass: 'text-indigo-700' };
    case 'SNACK':
      return { label: 'Snack', bgClass: 'bg-amber-50 border-amber-200', textClass: 'text-amber-700' };
    case 'BEVERAGE':
      return { label: 'Beverage', bgClass: 'bg-cyan-50 border-cyan-200', textClass: 'text-cyan-700' };
    case 'DESSERT':
      return { label: 'Dessert', bgClass: 'bg-rose-50 border-rose-200', textClass: 'text-rose-700' };
    case 'OTHER':
      return { label: 'Other', bgClass: 'bg-slate-100 border-slate-200', textClass: 'text-slate-700' };
    default:
      return { label: 'Item', bgClass: 'bg-slate-50 border-slate-200', textClass: 'text-slate-700' };
  }
}

/**
 * Checks whether swapping between two categories is allowed.
 * Smart Swap strictly requires like-for-like (MEAL -> MEAL, SNACK -> SNACK, etc.).
 */
export function isValidSwapCategoryMatch(originalCategory: FoodCategory, candidateCategory: FoodCategory): boolean {
  return originalCategory === candidateCategory;
}
