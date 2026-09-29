# EcoBite AI — Live Demo & Evaluator Guide

**Platform:** EcoBite AI  
**Pilot Campus:** Maharaja Agrasen Institute of Technology (MAIT), Rohini, Delhi  
**Architecture:** Zero-Trust Dual-Mode (Public General Mode vs Verified Campus Mode)

---

## ?? 1. Live Application Access

- **Live Production URL (GitHub Pages)**: [https://pra27-06.github.io/ecobite/](https://pra27-06.github.io/ecobite/)
- **Firebase Hosting Endpoint (Configured via `firebase.json`)**: [https://ecobite-ai.web.app/](https://ecobite-ai.web.app/)
- **GitHub Source Repository**: [https://github.com/pra27-06/ecobite](https://github.com/pra27-06/ecobite)

---

## ?? 2. Demo Credentials & Authentication

EcoBite AI provides automatic, frictionless access for hackathon evaluators without requiring real phone numbers or pre-registration:

| User Type | Credentials | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **Guest Student** | Anonymous Session (Default) | `student` | Nationwide Food Analysis, Search, Scan |
| **Verified MAIT Student** | QR Scanned via `/campus` | `student` (verified) | Live MAIT Canteens, Verified Prices, Smart Swaps, Impact Logging |
| **MAIT Campus Admin** | Toggle via Evaluator Demo Switch on `/admin` | `campus_admin` | Edit item prices (e.g. ?30 ? ?35), toggle availability, manage stalls |

> **Security Note**: No real passwords or production private keys are hardcoded in the application.

---

## ?? 3. MAIT Campus Access Instructions

1. Navigate to **Campus Access** (`/campus`) from the top navigation bar or home screen.
2. In the **Not Verified** card, click **Scan Official Campus QR**.
3. The simulator processes the authentic physical campus token (`MAIT_CAMPUS_AUTH_TOKEN_V1`).
4. Your active session immediately transitions to **`MAIT Campus — Verified`**.
5. All 4 official MAIT cafeteria counters unlock:
   - **Amul Shop** (26 verified items)
   - **Food Mast** (25 verified items)
   - **Juice Point** (13 verified items)
   - **Nescafé / Maggi Point** (11 verified items)
6. To return to General Mode at any time, click **Leave Campus / Revoke Access**.

---

## ?? 4. Recommended Demo Sequence (3–5 Minutes)

### Step 1: Landing & General Food Analysis (General Mode)
- Open the application at `/`.
- Notice the clear value proposition: *"Healthier • Cheaper • More Sustainable"*.
- Initial state shows: `General Mode — Nationwide Access`.
- Open **Search Food** (`/search`) and search for **"Chole Bhature"**.
- View the 3D analysis: **BODY** (3.5/10), **WALLET** (7.2/10), and **PLANET** (5.8/10).
- Notice that campus canteen prices are safely protected and not exposed.

### Step 2: Campus QR Verification
- Click **Campus Access** (`/campus`).
- Click **Scan Official Campus QR** to verify as a MAIT student.
- Observe verified status badge update globally across the app.

### Step 3: Campus-Grounded Smart Swap
- Open the Smart Swap for **Chole Bhature** (`/swap/Chole%20Bhature`).
- Observe the hero value banner: *"You don't just get a score. You get a better option you can actually buy."*
- Review the recommended campus alternative: **Paneer Sandwich** available at **Amul Shop** at verified **?30** (or updated **?35**).
- Notice the explicit badges: **AI Estimate** (nutrition scores) vs **Verified Campus Data** (menu price & in-stock counter status).
- Click **Accept Smart Swap (Save ?45)**.

### Step 4: Real Weekly Impact Dashboard
- Navigate to **Weekly Impact** (`/impact`).
- Confirm that real accumulated impact appears: **?45 Saved**, **1 Smart Swap**, **Estimated CO2e Avoided**, and the chronological log entry.
- Notice that without swaps, the system displays an honest empty state: *"Your impact journey starts with your first Smart Swap."*

### Step 5: Admin Price Edit & Instant Student-Side Propagation
- Navigate to **MAIT Admin** (`/admin`).
- Notice that a normal student receives a **403 Forbidden** security card.
- Click **Simulate MAIT Campus Admin Role** using the in-app Evaluator Demo Switch.
- Locate **Paneer Sandwich** (Amul Shop) in the inventory table.
- Click **Edit**, change the price from **?30 to ?35**, and click **Save Changes**.
- Click **Switch to Student Session**.
- Navigate back to **Campus Access** (`/campus`) or rerun the Smart Swap: **Paneer Sandwich** immediately displays the updated verified price of **?35** directly from the dynamic catalog without hardcoding!

---

## ?? 5. Known Limitations & Boundaries

1. **Audited Campus Scope**: Only **MAIT** contains a ground-truth dataset extracted from physical menu board photographs. Other colleges (e.g. DTU, NSUT) are intentionally not fabricated.
2. **Static QR Token for Evaluation**: The evaluation flow uses a static cafeteria token (`MAIT_CAMPUS_AUTH_TOKEN_V1`). Commercial production will utilize dynamic rotating TOTP QR codes refreshed every 60 seconds on physical canteen displays.
3. **Hardware Camera Permissions**: Mobile plate scanning relies on standard browser `getUserMedia` permissions. When camera access is declined, the file upload / gallery pipeline serves as a reliable fallback.
4. **Local Override Store**: Admin price adjustments update in-memory and `localStorage` to guarantee seamless live evaluation even during network latency or offline judging environments.

---

## ?? 6. Important Notes for Hackathon Judges

- **One National App, Dual Mode**: EcoBite provides universal nutrition insights nationwide while strictly isolating verified campus cafeteria menus.
- **Database = Facts, AI = Reasoning**: Google Gemini provides nutritional approximations, but Cloud Firestore controls all prices, stall locations, and availability states.
- **No Marketing Hype**: All metrics (? saved, kg CO2e avoided) are calculated deterministically from verified decisions.
