# EcoBite AI — Smart Swap Recommendation Logic

> **Document Version:** 2.0.0 (Health-First & Price Proximity Standard)  
> **Status:** Active Reference Architecture

---

## 1. Core Principles of Smart Swap

Smart Swap provides actionable, realistic campus food alternatives. To remain credible and useful to students, it enforces three ironclad guardrails:

### 1. Strict Like-for-Like Category Matching
Alternatives must belong to the exact same culinary category:
- `MEAL` $\to$ `MEAL` (e.g. *Chole Bhature* $\to$ *Paneer Sandwich* or *Rajma Chawal*)
- `SNACK` $\to$ `SNACK` (e.g. *Samosa* $\to$ *Aloo Patties*)
- `BEVERAGE` $\to$ `BEVERAGE` (e.g. *Sweet Soda* $\to$ *Fresh Mosambi Juice* or *Kulhad Tea*)
- `DESSERT` $\to$ `DESSERT` (e.g. *Brownie* $\to$ *Fruit Chill*)

Cross-category swaps (e.g. *Chole Bhature* $\to$ *Tea* or *Brownie* $\to$ *Fruit Chill*) are strictly forbidden.

### 2. Price Proximity Rule (`MAX_PRICE_DEVIATION = 0.10`)
Students operate on tight daily budgets. Recommending a dish that is substantially more expensive undermines trust:
- Candidates must satisfy: $\text{price} \le \text{originalPrice} \times (1 + 0.10)$
- Candidates costing $>10\%$ more than the original food are strictly disqualified, regardless of health score.
- Candidates equal to or cheaper than the original food are strongly preferred.
- If no alternative meets this criteria:
  > *"No healthier verified campus option found within your price range."*

### 3. Health-First Optimization Multiplier
Health improvement ($\Delta H$) is the dominant objective function:
$$\text{Score} = (\Delta H \times 1000) + \text{Savings Score} + \text{Sustainability Score}$$
This ensures the engine always recommends the most nutritious meal within category and price constraints.

---

## 2. Explicit Student Actions: Select vs Reject

On the Smart Swap screen, students are given two explicit decision paths:

1. **[ ✓ SELECT THIS SWAP ]**:
   - Dispatches a `SMART_SWAP_ACCEPTED` demand signal (+3 pts) to the Canteen Intelligence Dashboard.
   - Saves positive money saved (₹) to the student's personal impact telemetry.
   - Shows confirmation: *"Smart Swap selected! You saved ₹X."*

2. **[ ✕ REJECT ]**:
   - Dispatches a `SMART_SWAP_REJECTED` demand signal (-2 pts) to the Canteen Intelligence Dashboard.
   - Records ₹0 savings (does not distort the student's real financial savings).
   - Shows confirmation: *"Got it. Your preference helps EcoBite understand campus food choices."*
