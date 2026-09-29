# EcoBite AI — Canteen Intelligence & Kitchen Operations

> **Document Version:** 1.0.0 (Canteen B2B Intelligence Specification)  
> **Status:** Active Reference Architecture  
> **Target Audience:** Canteen Operators, University Dining Services, Hackathon Evaluators

---

## 1. Overview & Business Value

While students use EcoBite AI to make healthier, more affordable meal decisions, campus canteen operators struggle with a different challenge: **unpredictable daily kitchen demand and operational food waste**.

Campus dining halls typically prepare large batches of food each morning with little visibility into student cravings, resulting in:
- High preparation of low-demand items that get thrown out at the end of the day.
- Midday stockouts of high-demand healthy items (e.g. *Paneer Sandwiches* or *Rajma Chawal*).
- Excessive reliance on commercial deep fryers due to perceived demand.

The **EcoBite Canteen Intelligence Dashboard** (`/owner`) closes this loop by connecting **student pre-purchase demand signals** directly with **kitchen production adjustments**.

---

## 2. The Student-to-Kitchen Data Loop

```
  [STUDENT ECOBITE APP]
  • Dish searches (e.g. 188 Chole Bhature queries)
  • Plate photo scans
  • Smart Swap recommendations
  • Accepted healthy swaps (e.g. 42 chose Paneer Sandwich)
          │
          ▼
  [ANONYMOUS AGGREGATION ENGINE]
  • Aggregates queries by campusId (e.g. MAIT)
  • Strips all user identifiers (UID, email, name)
  • Computes item-level demand volume & swap acceptance rate
          │
          ▼
  [CANTEEN OWNER DASHBOARD (/owner)]
  • Live item-level demand signals
  • Kitchen batch recommendations (+15% prep on Paneer Sandwich)
  • Waste mitigation alerts (cut prep on Singapori Chowmein)
  • Real-time stock toggle (In-Stock / Sold-Out)
```

---

## 3. Core Dashboard Modules

### 3.1 Today's Operational Overview
- **Total Campus Meals**: Volume across all mapped cafeteria counters.
- **Estimated Daily Revenue**: Grounded in audited MAIT menu prices (₹15 – ₹150).
- **Peak Demand Dish**: Top queried item by students on campus.
- **Estimated Excess**: Total projected unconsumed portions based on daily prep vs sold volume.

### 3.2 Student Demand Signals & Healthy Conversions
The dashboard tracks how EcoBite's Smart Swap engine influences real purchasing:
- **Conversion Example**: 42 students searching for *Chole Bhature* (₹70) accepted swaps to *Paneer Sandwich* (₹30) or *Rajma Chawal* (₹70).
- **Operational Takeaway**: Informs kitchen staff to reallocate morning ingredient prep toward high-satiety, high-margin fresh items.

### 3.3 Menu Intelligence & Waste Mitigation Table
Provides item-by-item operational metrics:
- **Dish Name & Stall**: Linked to physical canteen (e.g. *Amul Shop*, *Food Mast*, *Juice Point*).
- **Canonical Category**: `MEAL`, `SNACK`, `BEVERAGE`, `DESSERT`.
- **Verified Ground-Truth Price**: Sourced from audited menu boards.
- **Daily Prep vs Sold Progress**: Visual percentage indicator of consumed stock.
- **Waste Risk Index**:
  - `LOW`: Sold $\ge 85\%$ of prepared batch.
  - `MEDIUM`: Sold $60\% - 84\%$.
  - `HIGH`: Sold $< 60\%$ (indicates systematic over-preparation).
- **Recommended Kitchen Action**: Concrete operational suggestions (e.g. *"Reduce preparation batch by 30%"*, *"Prepare strictly on-demand to eliminate oil/prep excess"*).
- **Live Stock Status**: Operator toggle to mark items Sold Out or In Stock in real-time.

---

## 4. Ethical Data Boundaries: Demo vs Operational Waste Data

> [!IMPORTANT]
> **No Fake Sensor Claims**: EcoBite AI does **not** claim physical sensor-based food waste detection from student plate scans alone. 

### Operational Distinctions:
1. **Demo / Sample Data (Current Prototype)**:
   - Daily prepared quantities, sold units, and excess estimations are realistic demonstration figures designed to showcase the B2B dashboard capability for hackathon judges.
   - All demo figures are explicitly labeled with `DEMO / SAMPLE DATA` badges.
2. **Authoritative Ground Truth**:
   - Menu item names, categories, physical counters, and INR (₹) prices are 100% verified against audited MAIT physical menu board photographs.
3. **Future Production Integrations**:
   - In production deployments, actual waste figures connect to:
     - Kitchen inventory management sheets.
     - Campus Point-of-Sale (POS) transaction logs.
     - Direct chef/operator end-of-day kitchen scale logging.

---

## 5. Strict Student Privacy Guarantees

The Canteen Owner Dashboard strictly enforces zero exposure of personal identifiable information (PII):
- **Zero Student Names**: No student profiles or accounts are shown.
- **Zero Personal Histories**: Operators cannot inspect what an individual student ate.
- **Aggregated Heatmaps Only**: All metrics represent anonymous campus-wide totals (e.g. *"Paneer Sandwich: 142 searches this week"*).
