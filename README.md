# EcoBite AI ??

> **AI-Powered Food Decision Platform for Indian College Campuses**  
> *"Healthier. Cheaper. More Sustainable."*

EcoBite AI empowers Indian college students to make healthier, more affordable, and eco-conscious food choices by bridging universal nutritional intelligence with verified, live campus canteen menus and pricing.

---

## 🖥️ Student + Canteen Owner Two-Screen Presentation Demo

EcoBite AI supports an interactive **Two-Device Presentation Setup** for hackathon evaluations:

| Device | Interface | Role & Capabilities |
| :--- | :--- | :--- |
| **Device 1 (Student)** | `Home` (`/`), `Search` (`/search`), `Scan` (`/scan`) | Food discovery, 3-tier image scan confidence, category-aware Smart Swaps (meals only swap with meals), verified MAIT prices, and weekly impact tracking. |
| **Device 2 (Canteen Owner)** | `Canteen Intelligence` (`/owner`) | Real-time student demand heatmaps, conversion pairs (e.g. Chole Bhature → Paneer Sandwich), waste mitigation indicators (demo data), and live stock toggles without exposing student PII. |
| **Audience Smartphone** | Point Camera at On-Screen **Demo QR** | Instantly launches the verified student experience on personal devices with an isolated demo token. |

---

## 🥗 Category-Aware Smart Swap Rules

To eliminate unrealistic recommendations (e.g. recommending a dessert or beverage for a hot meal), the engine enforces strict category boundaries:

- **`MEAL` → `MEAL`**: *Chole Bhature* or *Paneer Sandwich* will **never** suggest *Tea* or *Fruit Chill*. They recommend verified campus meals like *Rajma Chawal*, *Choley Chawal*, or *Veg Sandwich*.
- **`SNACK` → `SNACK`**: *Aloo Patties* recommends healthy snack alternatives.
- **`BEVERAGE` → `BEVERAGE`**: *Tea* or *Sugary Frappe* recommends *Fresh Mosambi Juice* or *Hot Coffee*.
- **`DESSERT` → `DESSERT`**: *Fruit Chill* or *Brownie* recommends lighter dessert alternatives.
- **Health-First Objective**: Health improvement (ΔH) is given primary priority (1000× dominant multiplier) so healthier options always supersede merely cheaper items.

---

## ?? Live Application & Repositories

- **Live Production URL (GitHub Pages)**: [https://pra27-06.github.io/ecobite/](https://pra27-06.github.io/ecobite/)
- **Firebase Hosting Endpoint**: [https://ecobite-ai.web.app/](https://ecobite-ai.web.app/)
- **Source Code Repository**: [https://github.com/pra27-06/ecobite](https://github.com/pra27-06/ecobite)
- **Evaluator & Judge Guide**: [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md)

---

## ?? Key Architectural Principles

1. **One National Application, Dual Mode**:
   - **General Public Mode**: Universal nutrition analysis, affordability tiers, and carbon footprint metrics for popular Indian food items. Anyone nationwide can search or scan meals.
   - **Verified Campus Mode**: Unlocks real-time canteen menus, live stall availability, and exact Firestore prices behind physical QR verification.
2. **Physical QR Access Protocol**: Selecting a college from a dropdown does **not** grant access. Official QR codes deployed at physical campus locations verify legitimate students.
3. **Database = Verified Facts | AI = Reasoning**: Generative AI evaluates nutrition and recommends Smart Swaps, but **never fabricates** campus prices or menu availability. All prices and stock status are grounded in verified database records.
4. **Multi-Campus Architecture**: Scalable isolation via `campusId`. **Maharaja Agrasen Institute of Technology (MAIT), Rohini, Delhi** is the official pilot institution.
5. **Clear Badging (Responsible AI)**: The interface strictly distinguishes **AI ESTIMATE** (nutritional approximations, health scores) from **VERIFIED CAMPUS DATA** (audited menu prices, stall locations, counter stock).
6. **No Marketing Hype / Honest Metrics**: All impact metrics (money saved, estimated carbon avoided) are derived exclusively from actual user Smart Swap logs. When a user has 0 logs, the platform displays an honest empty state: *"Your impact journey starts with your first Smart Swap."*

---

## ?? Recommended Demo Flow (3�5 Minutes)

For hackathon judges and evaluators, EcoBite AI is engineered to be experienced as **one connected product**:

```
1. Open EcoBite AI Home (/)
   +-- Notice clean positioning: "Healthier � Cheaper � More Sustainable"
   +-- Notice initial status: "General Mode � Nationwide Access"
           �
           ?
2. Explore General Food Analysis (/search or /scan)
   +-- Search for "Chole Bhature"
   +-- Review 3D scores: BODY (3.5/10), WALLET (7.2/10), PLANET (5.8/10)
   +-- Observe that internal campus prices remain safely hidden
           �
           ?
3. Enter & Verify MAIT Campus (/campus)
   +-- Click "Scan Official Campus QR" (or use demo verification token)
   +-- Session immediately updates to: "MAIT Campus � Verified"
   +-- Unlocks all 4 official MAIT canteens (Amul Shop, Food Mast, Juice Point, Nescafe)
           �
           ?
4. Experience the Smart Swap Engine (/swap/Chole%20Bhature)
   +-- Hero message: "You don't just get a score. You get a better option you can actually buy."
   +-- Recommended Campus Alternative: Paneer Sandwich (Amul Shop) at verified ?30
   +-- Displays: Exact canteen location, in-stock status, and SAVE ?40�?45
   +-- Notice explicit distinction: "AI Estimate" vs "Verified Campus Data"
           �
           ?
5. Accept Smart Swap & Verify Impact Telemetry
   +-- Click "Accept Smart Swap & Log Savings"
   +-- Navigate to Weekly Impact (/impact)
   +-- Observe live ? saved, CO2e avoided, and persistent swap log entry
           �
           ?
6. Canteen Admin Dashboard & Live Price Propagation (/admin)
   +-- Normal student access receives 403 Forbidden (RBAC)
   +-- Click "Simulate MAIT Campus Admin Role"
   +-- Locate "Paneer Sandwich" (Amul Shop) ? Edit price from ?30 to ?35 ? Save
   +-- Click "Switch to Student Session"
   +-- Revisit Campus Stalls (/campus) or Smart Swap: Paneer Sandwich immediately displays ?35!
```

---

## ?? Tech Stack

- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Routing**: React Router DOM (v7) with `import.meta.env.BASE_URL` support
- **Backend & Identity**: Firebase Authentication (Email/Password, Google OAuth, Anonymous Guest), Cloud Firestore, Firebase Storage
- **AI Intelligence**: Google Gemini API multimodal integration + Offline Indian Food Knowledge Base fallback
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`) for GitHub Pages + Firebase Hosting configuration (`firebase.json`)
- **Security**: Granular Cloud Firestore Security Rules, Role-Based Access Control (Student vs Campus Admin)
- **Documentation**: 
  - [`docs/SMART_SWAP_LOGIC.md`](docs/SMART_SWAP_LOGIC.md) - Category compatibility, health-first ranking, and guardrails
  - [`docs/CANTEEN_INTELLIGENCE.md`](docs/CANTEEN_INTELLIGENCE.md) - Student demand signals, kitchen prep, and waste mitigation
  - [`docs/DEMO_MODE.md`](docs/DEMO_MODE.md) - Judge demo mode, two-device presentation, and safe demo QR
  - [`docs/ECOBITE_CONTEXT.md`](docs/ECOBITE_CONTEXT.md) � Master product context and architecture
  - [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) � Firebase configuration & collection guides
  - [`docs/MAIT_DATA.md`](docs/MAIT_DATA.md) � Official MAIT canteen dataset & stall mappings
  - [`docs/AI_ARCHITECTURE.md`](docs/AI_ARCHITECTURE.md) � Gemini multimodal architecture & system prompts
  - [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) � Complete security review, rules audit & threat model
  - [`docs/FINAL_DEMO_CHECKLIST.md`](docs/FINAL_DEMO_CHECKLIST.md) � Step-by-step verification checklist
  - [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md) � Comprehensive evaluator guide & live demo manual

---

## ? Local Setup & Deployment

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/pra27-06/ecobite.git

# Enter project directory
cd ecobite

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Typecheck & Production Build
```bash
# Run TypeScript compilation and Vite build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Configuration
1. **GitHub Pages Deployment**:
   - Automated via GitHub Actions workflow (`.github/workflows/deploy.yml`).
   - Every push to `main` builds the application with `VITE_BASE_PATH=/ecobite/` and publishes to GitHub Pages.
2. **Firebase Hosting Deployment**:
   - `firebase.json` defines SPA routing rewrites:
     ```bash
     firebase login
     firebase use your-project-id
     firebase deploy --only hosting,firestore:rules,storage
     ```

---

## ?? Environment Variables

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Environment variables accepted:
```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Optional: Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
> **Zero Crash Fallback**: If these environment variables are omitted, the application runs gracefully in local fallback mode with high-fidelity schemas and zero unhandled exceptions.

---

## ??? Security Posture & Rules Overview

Cloud Firestore Security Rules (`firestore.rules`) enforce granular least-privilege access:
- **Canteen Menus (`/menuItems`)**: Public read is restricted to verified campus sessions. Write operations require `isCampusAdmin(campusId)`. Students can **never** edit prices.
- **User Roles (`/users`)**: Role escalation is blocked server-side; students cannot self-assign `campus_admin` or `campusVerified: true`.
- **Impact Logs (`/impactLogs`)**: Query and read access are strictly owner-isolated (`request.auth.uid == userId`); updates and deletes are disabled.
- **Secrets Management**: No private keys or service accounts committed. Safe environment templates provided in `.env.example`.

---

## ?? Known Prototype Limitations (Honest Assessment)

1. **Pilot Scope**: Only **MAIT** has an audited, verified menu dataset extracted from physical menu board photographs. No fake or unverified data exists for other colleges (e.g. DTU, NSUT).
2. **Static QR Token for Evaluation**: The physical QR code uses a static identifier token (`MAIT_CAMPUS_AUTH_TOKEN_V1`) to enable easy evaluation. A commercial production deployment will introduce rotating TOTP tokens regenerated every 60 seconds on physical cafeteria displays.
3. **Client-Assisted Timestamps**: Impact log timestamps are recorded via client ISO strings or Firestore server timestamps; high-security production deployments will enforce server-only timestamps via Cloud Functions.
4. **Local Override Layer**: To guarantee smooth live evaluator demos even when running offline or without active Firebase credentials, price adjustments made in `/admin` persist to `localStorage` and memory.
