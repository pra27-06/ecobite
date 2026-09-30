/**
 * EcoBite AI - Smart Swap Decision Logic Test Suite
 * 
 * Verifies strict Pareto improvement across 3 decision dimensions:
 * 1. Health
 * 2. Sustainability
 * 3. Affordability
 * 
 * Rule:
 * - At least one metric must strictly improve (↑)
 * - NO metric may become worse (no ↓)
 * - Same food category only (MEAL -> MEAL, SNACK -> SNACK, etc.)
 * - If no candidate satisfies this, DO NOT SHOW A SMART SWAP CARD.
 *   Returns: "No verified healthier/better campus option found for this choice."
 */

const assert = require('assert');

// 1. Food Category Classifier (mirroring swapService.ts)
function classifyFoodCategory(name, rawCategory) {
  const n = name.toLowerCase();
  const c = (rawCategory || '').toLowerCase();

  if (
    n.includes('chai') || n.includes('tea') || n.includes('coffee') ||
    n.includes('shake') || n.includes('juice') || n.includes('lassi') ||
    n.includes('mojito') || n.includes('chaas') || n.includes('crush') ||
    n.includes('beverage') || c === 'beverage' || c === 'beverages'
  ) {
    return 'BEVERAGE';
  }

  if (
    n.includes('brownie') || n.includes('ice cream') || n.includes('pastry') ||
    n.includes('dessert') || c === 'dessert' || c === 'desserts'
  ) {
    return 'DESSERT';
  }

  if (
    n.includes('thali') || n.includes('chawal') || n.includes('bhature') ||
    n.includes('roti') || n.includes('paratha') || n.includes('meal') ||
    n.includes('kulcha') || n.includes('dosa') || n.includes('uttapam') ||
    c === 'meals' || c === 'indian-meals'
  ) {
    return 'MEAL';
  }

  return 'SNACK';
}

// 2. Health and Sustainability Estimators (mirroring swapService.ts)
function estimateItemHealthScore(item) {
  const n = item.name.toLowerCase().trim();
  const cat = (item.category || '').toLowerCase().trim();

  if (n.includes('salad') || n.includes('sprout')) return 9.0;
  if (n.includes('chaas') || n.includes('buttermilk')) return 8.5;
  if (n.includes('juice') && !n.includes('packed')) return 8.0;
  if (n.includes('paneer sandwich') || n.includes('veg sandwich')) return 7.8;
  if (n.includes('paneer wrap') || n.includes('paneer roll')) return 7.6;
  if (n.includes('paneer kulcha') || n.includes('kulcha')) return 7.2;
  if (n.includes('rajma') || n.includes('dal') || n.includes('choley')) return 7.8;
  if (n.includes('idli') || n.includes('dosa') || n.includes('poha')) return 7.5;
  if (n.includes('bhature')) return 3.5;
  if (n.includes('samosa') || n.includes('patties')) return 3.6;
  if (n.includes('maggi') || n.includes('noodles')) return 4.0;

  if (cat === 'meals' || cat === 'indian-meals') return 7.2;
  return 6.0;
}

function estimateItemSustainabilityScore(item) {
  const n = item.name.toLowerCase().trim();
  if (n.includes('juice') || n.includes('fruit')) return 8.5;
  if (n.includes('rajma') || n.includes('choley') || n.includes('dal')) return 8.2;
  if (n.includes('soup') || n.includes('tea')) return 7.5;
  if (n.includes('paneer') || n.includes('cheese')) return 6.5;
  if (n.includes('maggi') || n.includes('chowmein')) return 5.5;
  return 6.5;
}

// 3. Core Evaluation Logic Function
function evaluateCandidateSwap({
  origItem,
  origHealth,
  origSust,
  origPrice,
  origCategory,
  candidateItem
}) {
  const EPSILON = 0.05;

  // 1. Category Check
  const candCategory = classifyFoodCategory(candidateItem.name, candidateItem.category);
  if (candCategory !== origCategory) {
    return { valid: false, reason: 'CROSS_CATEGORY_MISMATCH' };
  }

  // 2. Identity Check (not exact same dish)
  if (candidateItem.name.toLowerCase().trim() === origItem.name.toLowerCase().trim()) {
    return { valid: false, reason: 'SAME_ITEM' };
  }

  const candHealth = estimateItemHealthScore(candidateItem);
  const candSust = estimateItemSustainabilityScore(candidateItem);
  const candPrice = candidateItem.price;

  const healthDelta = candHealth - origHealth;
  const sustDelta = candSust - origSust;
  const moneySaved = origPrice - candPrice; // positive if cheaper, negative if more expensive

  // Directional evaluations
  const healthImproves = healthDelta > EPSILON;
  const healthWorsens = healthDelta < -EPSILON;

  const sustImproves = sustDelta > EPSILON;
  const sustWorsens = sustDelta < -EPSILON;

  const affordImproves = moneySaved > 0.5;
  const affordWorsens = moneySaved < -0.5;

  const atLeastOneImproves = healthImproves || sustImproves || affordImproves;
  const noMetricWorsens = !healthWorsens && !sustWorsens && !affordWorsens;

  if (!atLeastOneImproves || !noMetricWorsens) {
    return {
      valid: false,
      reason: 'PARETO_RULE_VIOLATION',
      healthDelta,
      sustDelta,
      moneySaved,
      healthWorsens,
      sustWorsens,
      affordWorsens,
      atLeastOneImproves,
    };
  }

  const compositeScore = (healthDelta * 100) + (sustDelta * 50) + (moneySaved * 2);

  return {
    valid: true,
    compositeScore,
    healthDelta,
    sustDelta,
    moneySaved,
    candHealth,
    candSust,
    candPrice,
  };
}

// 4. Mock Menu Selector
function findBestCampusSmartSwap(originalFood, availableCatalog) {
  const origCategory = classifyFoodCategory(originalFood.name, originalFood.category);
  const origHealth = originalFood.healthScore;
  const origSust = originalFood.sustainabilityScore;
  const origPrice = originalFood.price;

  let bestCandidate = null;
  let highestScore = -Infinity;

  for (const candidate of availableCatalog) {
    if (!candidate.available || !candidate.verified) continue;

    const evaluation = evaluateCandidateSwap({
      origItem: originalFood,
      origHealth,
      origSust,
      origPrice,
      origCategory,
      candidateItem: candidate,
    });

    if (evaluation.valid && evaluation.compositeScore > highestScore) {
      highestScore = evaluation.compositeScore;
      bestCandidate = {
        item: candidate,
        evaluation,
      };
    }
  }

  if (!bestCandidate) {
    return {
      hasSwap: false,
      noSwapReason: 'No verified healthier/better campus option found for this choice.',
    };
  }

  return {
    hasSwap: true,
    recommendedSwap: bestCandidate.item,
    metrics: bestCandidate.evaluation,
  };
}

// ==========================================
// TEST SUITE EXECUTION
// ==========================================
console.log('------------------------------------------------------------');
console.log('🧪 RUNNING ECOBITE SMART SWAP LOGIC VERIFICATION');
console.log('------------------------------------------------------------');

// -------------------------------------------------------------------------
// TEST 1: PANEER SANDWICH vs PANEER KULCHA
// Paneer Sandwich (Health: 7.8, Sust: 6.5, Price: 30)
// Candidate: Paneer Kulcha (Health: 7.2, Sust: 6.5, Price: 30)
// Paneer Kulcha has LOWER health (7.2 < 7.8 => healthWorsens). MUST BE REJECTED!
// -------------------------------------------------------------------------
console.log('\n[Test 1] Paneer Sandwich vs Paneer Kulcha Rejection Guardrail:');
const paneerSandwich = {
  name: 'Paneer Sandwich',
  category: 'SNACK',
  price: 30,
  healthScore: 7.8,
  sustainabilityScore: 6.5,
};

const paneerKulcha = {
  name: 'Paneer Kulcha',
  category: 'SNACK',
  price: 30,
  available: true,
  verified: true,
};

const evalKulcha = evaluateCandidateSwap({
  origItem: paneerSandwich,
  origHealth: paneerSandwich.healthScore,
  origSust: paneerSandwich.sustainabilityScore,
  origPrice: paneerSandwich.price,
  origCategory: 'SNACK',
  candidateItem: paneerKulcha,
});

assert.strictEqual(evalKulcha.valid, false, 'Paneer Kulcha must NOT be accepted as a swap for Paneer Sandwich');
console.log(`  ✅ PASSED: Paneer Kulcha was correctly rejected (${evalKulcha.reason}).`);

// Also verify direct metric comparison: health drops from 7.8 to 7.2
const kulchaHealth = estimateItemHealthScore(paneerKulcha);
const healthDelta = kulchaHealth - paneerSandwich.healthScore;
assert.ok(healthDelta < -0.05, 'Health delta must be negative (-0.6)');
console.log(`  ✅ PASSED: Direct health check: ${kulchaHealth} < ${paneerSandwich.healthScore} (Health decreased by ${Math.abs(healthDelta).toFixed(1)} pts).`);

// -------------------------------------------------------------------------
// TEST 2: TEST CASES A THROUGH F (Pareto Permutations)
// -------------------------------------------------------------------------
console.log('\n[Test 2] Three-Dimensional Metric Pareto Rules:');

const baseDish = {
  name: 'Standard Dish',
  category: 'SNACK',
  price: 40,
};
const baseHealth = 6.0;
const baseSust = 6.0;
const basePrice = 40;

// Helper to test synthetic metric outcomes directly
function checkRule(healthDelta, sustDelta, moneySaved) {
  const EPSILON = 0.05;
  const healthImproves = healthDelta > EPSILON;
  const healthWorsens = healthDelta < -EPSILON;
  const sustImproves = sustDelta > EPSILON;
  const sustWorsens = sustDelta < -EPSILON;
  const affordImproves = moneySaved > 0.5;
  const affordWorsens = moneySaved < -0.5;

  const atLeastOneImproves = healthImproves || sustImproves || affordImproves;
  const noMetricWorsens = !healthWorsens && !sustWorsens && !affordWorsens;

  return atLeastOneImproves && noMetricWorsens;
}

// Case A: Health ↑, Sust ↑, Afford = => VALID
assert.strictEqual(checkRule(1.0, 1.0, 0), true, 'Case A should be VALID');
console.log('  ✅ Case A (Health ↑, Sust ↑, Afford =): VALID (ACCEPTED)');

// Case B: Health ↑, Sust =, Afford = => VALID
assert.strictEqual(checkRule(1.0, 0, 0), true, 'Case B should be VALID');
console.log('  ✅ Case B (Health ↑, Sust =, Afford =): VALID (ACCEPTED)');

// Case C: Health =, Sust ↑, Afford = => VALID
assert.strictEqual(checkRule(0, 1.0, 0), true, 'Case C should be VALID');
console.log('  ✅ Case C (Health =, Sust ↑, Afford =): VALID (ACCEPTED)');

// Case D: Health ↓, Sust ↑, Afford = => INVALID
assert.strictEqual(checkRule(-1.0, 1.0, 0), false, 'Case D should be INVALID');
console.log('  ✅ Case D (Health ↓, Sust ↑, Afford =): INVALID (REJECTED)');

// Case E: Health ↑, Sust ↓, Afford = => INVALID
assert.strictEqual(checkRule(1.0, -1.0, 0), false, 'Case E should be INVALID');
console.log('  ✅ Case E (Health ↑, Sust ↓, Afford =): INVALID (REJECTED)');

// Case F: Health =, Sust =, Afford = => INVALID
assert.strictEqual(checkRule(0, 0, 0), false, 'Case F should be INVALID');
console.log('  ✅ Case F (Health =, Sust =, Afford =): INVALID (REJECTED)');

// Additional Affordability Checks:
// Health =, Sust =, Afford ↑ (cheaper) => VALID
assert.strictEqual(checkRule(0, 0, 10), true, 'Affordability improvement should be VALID');
console.log('  ✅ Affordability Only (Health =, Sust =, Afford ↑): VALID (ACCEPTED)');

// Health ↑, Sust =, Afford ↓ (more expensive) => INVALID
assert.strictEqual(checkRule(1.0, 0, -10), false, 'More expensive option without parity should be INVALID');
console.log('  ✅ More Expensive Candidate (Health ↑, Sust =, Afford ↓): INVALID (REJECTED)');

// -------------------------------------------------------------------------
// TEST 3: CATEGORY PRESERVATION (Case G)
// -------------------------------------------------------------------------
console.log('\n[Test 3] Cross-Category Rejection (Case G):');
const mealDish = {
  name: 'Rajma Chawal',
  category: 'MEAL',
  price: 70,
  healthScore: 7.8,
  sustainabilityScore: 8.2,
};

const beverageCandidate = {
  name: 'Fresh Chaas',
  category: 'BEVERAGE',
  price: 20,
  available: true,
  verified: true,
};

const crossCatResult = evaluateCandidateSwap({
  origItem: mealDish,
  origHealth: mealDish.healthScore,
  origSust: mealDish.sustainabilityScore,
  origPrice: mealDish.price,
  origCategory: 'MEAL',
  candidateItem: beverageCandidate,
});

assert.strictEqual(crossCatResult.valid, false);
assert.strictEqual(crossCatResult.reason, 'CROSS_CATEGORY_MISMATCH');
console.log('  ✅ PASSED: Cross-category swap (MEAL -> BEVERAGE) was rejected.');

// -------------------------------------------------------------------------
// TEST 4: EMPTY STATE MESSAGE (Case H)
// -------------------------------------------------------------------------
console.log('\n[Test 4] Empty State Message when no valid alternative exists (Case H):');
// Catalog has only items that worsen at least one dimension
const poorCatalog = [
  {
    name: 'Fried Samosa',
    category: 'SNACK',
    price: 30, // same price, lower health
    available: true,
    verified: true,
  },
  {
    name: 'Cheese Maggi',
    category: 'SNACK',
    price: 50, // worse affordability, lower health
    available: true,
    verified: true,
  }
];

const emptySwapResult = findBestCampusSmartSwap(paneerSandwich, poorCatalog);
assert.strictEqual(emptySwapResult.hasSwap, false, 'hasSwap must be false');
assert.strictEqual(
  emptySwapResult.noSwapReason,
  'No verified healthier/better campus option found for this choice.'
);
console.log(`  ✅ PASSED: empty state returns hasSwap=false and message: "${emptySwapResult.noSwapReason}"`);

// -------------------------------------------------------------------------
// TEST 5: VALID HEALTHIER CAMPUS SWAP (e.g. Sprouted Salad / Veg Roll)
// -------------------------------------------------------------------------
console.log('\n[Test 5] Valid Swap Acceptance:');
const validCatalog = [
  {
    name: 'Sprouted Moong Salad',
    category: 'SNACK',
    price: 25, // ₹5 cheaper (Afford ↑), Health 9.0 vs 7.8 (Health ↑), Sust 8.5 vs 6.5 (Sust ↑)
    available: true,
    verified: true,
  }
];

const goodSwapResult = findBestCampusSmartSwap(paneerSandwich, validCatalog);
assert.strictEqual(goodSwapResult.hasSwap, true, 'hasSwap must be true');
assert.strictEqual(goodSwapResult.recommendedSwap.name, 'Sprouted Moong Salad');
assert.ok(goodSwapResult.metrics.healthDelta > 0, 'Health must improve');
assert.ok(goodSwapResult.metrics.sustDelta >= 0, 'Sustainability must not worsen');
assert.ok(goodSwapResult.metrics.moneySaved > 0, 'Money saved must be positive');
console.log(`  ✅ PASSED: Successfully recommended ${goodSwapResult.recommendedSwap.name} (Health ↑, Sust =, Afford ↑).`);

console.log('\n============================================================');
console.log('🎉 ALL SMART SWAP LOGIC TESTS PASSED SUCCESSFULLY!');
console.log('============================================================');
