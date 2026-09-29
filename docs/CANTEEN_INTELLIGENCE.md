# EcoBite AI — Canteen Owner & Demand Intelligence

> **Document Version:** 2.0.0 (Student Demand Intelligence Doctrine)  
> **Status:** Active Reference Architecture  
> **Target Audience:** Canteen Operators, University Dining Services, Hackathon Evaluators

---

## 1. Overview & Architectural Doctrine

EcoBite AI provides **Student Demand Intelligence**, not sales accounting or physical food waste sensing.

### What EcoBite Is:
- **Pre-Purchase Demand Aggregator**: Captures authentic student interest through dish searches and Smart Swap choices before food is bought or consumed.
- **Decision Support Tool**: Informs cafeteria staff on peak student preferences, high-converting healthy alternatives, and dishes with low student appetite.

### What EcoBite Is NOT:
- **NOT a POS or Cash Register Tracker**: Does not track cash/UPI payments or transaction receipts.
- **NOT a Physical Waste Sensor**: Does not place scales or optical cameras in garbage cans.
- **NOT an Inventory Surveillance Tool**: Does not track raw warehouse grams or chef prep speed.

---

## 2. Demand Signal Types & Weighting Formula

EcoBite records three atomic, privacy-safe demand signals within each campus boundary:

| Signal Event Type | Description | Weight | Operational Significance |
| :--- | :--- | :--- | :--- |
| `SEARCH` | A student queries or evaluates this dish | **+1** | Measures raw campus interest & pre-purchase curiosity |
| `SMART_SWAP_ACCEPTED` | A student selects this dish as a healthier alternative | **+3** | Strong positive indicator of healthy conversion & high student preference |
| `SMART_SWAP_REJECTED` | A student declines this dish when recommended | **-2** | Direct negative indicator showing taste resistance or price sensitivity |

### Dynamic Demand Score Formula:
$$\text{Demand Score} = (\text{Searches} \times 1) + (\text{Swaps Accepted} \times 3) + (\text{Swaps Rejected} \times -2)$$

---

## 3. Privacy Boundary & Zero Student PII

All demand signals conform to strict data-minimization principles:
- **No User IDs, Names, or Emails**: Demand signals are completely decoupled from student accounts.
- **No Personal Trajectories**: Canteen owners cannot see individual student dining histories.
- **Campus Aggregation**: Signals are aggregated solely at the campus level (`MAIT`) to safeguard user privacy.

---

## 4. Student Campus Access QR Generator

Canteen owners can generate official campus verification QR codes directly from the dashboard (`[ Generate Student Campus QR ]`):
- Displays the secure institutional token (`MAIT-DELHI-01`).
- Ready for counter display or printout so students can quickly scan and verify their session.
