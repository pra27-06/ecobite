# EcoBite AI — Smart Swap Recommendation Logic & Architecture

> **Document Version:** 2.0.0 (Category-Aware & Health-First Upgrade)  
> **Status:** Active Production Specification  
> **Target Audience:** Engineering, Product Evaluators, Hackathon Judges

---

## 1. Overview & Problem Definition

In earlier prototype iterations, the Smart Swap algorithm optimized composite scores across multiple dimensions without enforcing food type compatibility or prioritizing nutritional value. This resulted in non-viable recommendations:
- *Paneer Sandwich* (Meal) was recommended with *Tea* (Beverage).
- *Chole Bhature* (Meal) was recommended with *Fruit Chill* (Dessert / Ice Confectionery).
- Cheaper or more sustainable items could outrank substantially healthier meals simply due to price differentials.

The upgraded **EcoBite Smart Swap Engine** establishes two non-negotiable architectural guardrails:
1. **Strict Category Compatibility**: Like-for-like swaps only (`MEAL` $\to$ `MEAL`, `SNACK` $\to$ `SNACK`, `BEVERAGE` $\to$ `BEVERAGE`, `DESSERT` $\to$ `DESSERT`).
2. **Health-First Objective**: Nutritional health improvement ($\Delta H$) is the dominant ranking objective; cheaper or more sustainable items cannot supersede a substantially healthier alternative.

---

## 2. Food Category Classification System

Every food item, dish query, and canteen menu record is mapped to a canonical `FoodCategory`:

| Category | Definition & Criteria | Examples | Prohibited Swaps |
| :--- | :--- | :--- | :--- |
| **`MEAL`** | Substantial plate foods: rice bowls, curries, flatbreads, sandwiches, pasta, noodles, burgers. | *Chole Bhature*, *Rajma Chawal*, *Chole Chawal*, *Pav Bhaji*, *Paneer Sandwich*, *Veg Sandwich*, *Pasta*, *Chowmein*, *Masala Maggi*. | Cannot swap with `BEVERAGE`, `DESSERT`, or `SNACK`. |
| **`SNACK`** | Finger foods, savory baked/fried puffs, pastries, dumplings, appetizers. | *Aloo Patties*, *Paneer Patties*, *French Fries*, *Spring Roll*, *Kurkure Momos*, *Samosa*, *Spiral Potato*. | Cannot swap with `MEAL` or `DESSERT`. |
| **`BEVERAGE`** | Liquid refreshments, hot/cold drinks, milk teas, coffees, fresh juices, shakes, lassis. | *Tea (Chai)*, *Spl. Kulhad Tea*, *Hot Coffee*, *Cold Coffee*, *Fresh Mosambi Juice*, *Chocolate Shake*, *Brownie Shake*. | Cannot swap with `MEAL`, `SNACK`, or `DESSERT`. |
| **`DESSERT`** | Sweet confectionery, ice creams, brownies, frozen fruit bars, desserts. | *Brownie*, *Fruit Chill* (frozen fruit confectionery), *Ice Cream*, *Kulfi*. | Cannot swap with `MEAL` or `BEVERAGE`. |

> **Special Disambiguation**:  
> - **Brownie Shake**: Categorized as `BEVERAGE` because it is consumed as a liquid milkshake.  
> - **Fruit Chill**: Categorized as `DESSERT` (frozen ice confectionery) and is explicitly blocked from serving as a meal replacement.

---

## 3. End-to-End Recommendation Pipeline

```
          Student searches / scans food item
                          │
                          ▼
            [1. AI / Dish Recognition]
        Extracts dish name, nutrition estimate,
         and canonical category (FoodCategory)
                          │
                          ▼
        [2. Campus Verification Filter]
  ┌───────────────────────┴───────────────────────┐
  │ Unverified                                    │ Verified (MAIT)
  ▼                                               ▼
[General Benchmark]                     [Firestore Menu Query]
Returns benchmark within                Fetches verified, available dishes
the same category                       for this specific campus
  │                                               │
  │                                               ▼
  │                                     [3. Eligibility Gate]
  │                                     • Same FoodCategory only
  │                                     • available === true
  │                                     • verified === true
  │                                     • candidate !== originalDish
  │                                               │
  │                                               ▼
  │                                     [4. Health-First Ranking]
  │                                     • Health delta is primary multiplier (x1000)
  │                                     • Savings & carbon act as tie-breakers
  │                                               │
  │                                               ▼
  │                                     [5. Post-AI Sanity Guardrail]
  │                                     Rejects any cross-category candidate
  │                                               │
  └───────────────────────┬───────────────────────┘
                          │
                          ▼
         [Final Verified Smart Swap Displayed]
      Displays authentic stall name & verified price
```

---

## 4. Multi-Criteria Scoring & Ranking Formula

To guarantee that health is the primary objective, the engine evaluates eligible candidates using a tiered hierarchy:

### 4.1 Health Eligibility Threshold
- If the original food has **low to moderate health** ($\text{Health}_{\text{orig}} < 7.0$), the candidate **must improve health**:
  $$\Delta H = \text{Health}_{\text{candidate}} - \text{Health}_{\text{orig}} \ge 0.2$$
- If the original food is **already healthy** ($\text{Health}_{\text{orig}} \ge 7.0$, e.g. *Paneer Sandwich* $7.8$), the candidate must maintain a high health standard ($\text{Health}_{\text{candidate}} \ge 6.8$) while offering budget or nutritional variety.

### 4.2 Composite Score Calculation
$$\text{Score} = (\Delta H \cdot 1000) + \text{SavingsBonus} + \text{SustBonus}$$

Where:
- $\Delta H \cdot 1000$: Dominant term ensuring that an extra $+1.0$ in Body Health contributes $+1000$ points.
- $\text{SavingsBonus} = \min(\text{MoneySaved}, 30) \cdot 1.5$ (capped at $+45$ points to prevent cheap junk food or beverages from overriding nutrition).
- $\text{SustBonus} = \text{clamp}(\Delta S \cdot 2, -5, +10)$.

**Mathematical Guarantee**:  
A candidate providing $+2.5$ health improvement will receive a score $\ge 2500$, completely overwhelming any candidate that offers $+0.2$ health improvement and saves ₹50 (score $\approx 245$). Health **always** wins.

---

## 5. Post-AI Sanity Guardrail

Even if an external Large Language Model or probabilistic engine generates a recommendation, the client-side deterministic guardrail validates the candidate before rendering:

```typescript
if (bestCandidate) {
  const validatedCat = classifyFoodCategory(bestCandidate.name, bestCandidate.category);
  if (validatedCat !== origCategory) {
    console.error(`[Guardrail Rejection] Attempted cross-category swap from ${origCategory} to ${validatedCat}`);
    bestCandidate = null; // Rejected
  }
}
```

---

## 6. Deterministic No-Match Behavior

If no verified dish on campus meets both the category compatibility and health improvement thresholds:
- The engine sets `hasSwap: false`.
- It displays:  
  > *"No verified [Category] alternative currently available provides a significant health improvement."*
- EcoBite **never** fabricates an ill-fitting item (like a beverage or dessert) to artificially fill the recommendation card.
