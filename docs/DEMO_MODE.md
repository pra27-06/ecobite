# EcoBite AI — Judge Demo Mode & Two-Device Presentation Guide

> **Document Version:** 1.0.0  
> **Status:** Active Evaluator Guide  
> **Target Audience:** Hackathon Judges, Evaluators, Presenters

---

## 1. Overview & Demonstration Architecture

EcoBite AI provides a controlled, self-contained **Demo Mode** specifically engineered for 3-to-5 minute hackathon presentations.

It supports an interactive **Two-Device Presentation Setup**:
- **Device 1 (Student Experience)**: Demonstrates the student journey—searching/scanning meals, receiving category-aware Smart Swaps, and logging verified campus pocket savings.
- **Device 2 (Canteen Owner Experience)**: Demonstrates the B2B operational dashboard—visualizing how student food decisions aggregate into real-time kitchen prep adjustments and waste mitigation.

---

## 2. Interactive Demo Access & Safe Demo QR

### 2.1 One-Click Launch
1. On the top navigation bar or the home screen, click **[ Judge Demo ]**.
2. A modal opens presenting:
   - **Student Demo Button** (Device 1)
   - **Canteen Owner Demo Button** (Device 2)
   - **Interactive Demo QR Code**

### 2.2 Safe Demo QR Token
- **Payload**: `https://pra27-06.github.io/ecobite/campus?demo=student&campus=mait`
- **Security Posture**: The QR code strictly contains an isolated demo pass token. It **never** contains private database connection strings, API keys, or raw student telemetry.
- **Audience Interaction**: Evaluators can point their own smartphone cameras at the screen to launch the Student Demo immediately on their mobile browser.

---

## 3. Two-Device Presentation Flow (Recommended)

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
│        DEVICE 1: STUDENT VIEW          │       │      DEVICE 2: CANTEEN OWNER VIEW      │
│     (URL: / or /campus or /search)     │       │             (URL: /owner)              │
├────────────────────────────────────────┤       ├────────────────────────────────────────┤
│ 1. Open Home Page                      │       │ 1. Open Canteen Intelligence Dashboard │
│ 2. Show General Mode (Public)          │       │ 2. Show Today's Overview (648 meals)   │
│ 3. Unlock MAIT Campus via Demo Pass    │       │ 3. Observe Peak Demand: Chole Bhature  │
│ 4. Search/Scan a food (Chole Bhature)  │       │ 4. Observe Healthy Beneficiary:        │
│ 5. Review Body / Wallet / Planet       │       │    Paneer Sandwich (+15% prep)         │
│ 6. View Smart Swap:                    │       │ 5. Review Waste Mitigation Actions:    │
│    Recommends Paneer Sandwich (Meal)   │       │    Cut prep on Singapori Chowmein      │
│    (Tea and Fruit Chill NEVER appear)  │       │ 6. Toggle Item Availability in real-   │
│ 7. Accept Swap & Log Savings           │       │    time to reflect kitchen stock       │
└────────────────────────────────────────┘       └────────────────────────────────────────┘
```

---

## 4. Key Demo Scenarios to Showcase

### Scenario A: Strict Category-Aware Smart Swap
1. Go to **Search** or **Smart Swap**.
2. Search for **Chole Bhature** (Heavy Meal, Health 3.5).
3. **Show Evaluators**: The Smart Swap recommends **Paneer Sandwich** (₹30) or **Rajma Chawal** (₹70)—both nutritious, high-protein **MEAL** alternatives.
4. **Point Out**: Notice that *Tea* (Beverage) and *Fruit Chill* (Dessert) **never appear** because the engine strictly enforces like-for-like meal compatibility.

### Scenario B: High-Health Original Item
1. Search for **Paneer Sandwich** (Meal, Health 7.8).
2. **Show Evaluators**: Since the dish is already healthy, the engine recommends another high-quality meal (e.g. *Rajma Chawal* or *Veg Sandwich*), never downgrading to junk food or tea.

### Scenario C: Robust 3-Tier Image Recognition
1. Go to **Scan Food** (`/scan`).
2. Click the test sample: **"Obscure Meal (Test Uncertainty)"** or upload an ambiguous food photo.
3. **Show Evaluators**: The AI does **not** invent a fake dish. It transparently flags **"We couldn't confidently identify this food"**, shows verified campus candidate chips (*Pasta*, *Chole Bhature*, *Paneer Sandwich*), and provides a one-click **[ Search Food Manually ]** button.

### Scenario D: Canteen Owner B2B Value
1. Navigate to `/owner`.
2. Show how anonymous student searches feed directly into kitchen demand signals.
3. Show the **Menu Intelligence Table** with real-time stock toggles and waste-reduction recommendations.
