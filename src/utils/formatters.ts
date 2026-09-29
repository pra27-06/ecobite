/**
 * Currency & Metric Formatters
 */

/**
 * Format currency amount in Indian Rupee format
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format carbon reduction in grams / kilograms
 */
export function formatCarbon(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg CO₂`;
  }
  return `${grams} g CO₂`;
}
