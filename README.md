# EcoBite AI ??

> **AI-Powered Food Decision Platform for Indian College Campuses**

EcoBite AI empowers Indian college students to make healthier, more affordable, and eco-conscious food choices by bridging universal nutritional intelligence with verified, live campus canteen menus and pricing.

---

## ?? Key Architectural Principles

1. **One National Application, Dual Mode**:
   - **General Public Mode**: Universal nutrition analysis, affordability tiers, and carbon footprint metrics for popular Indian food items. Anyone nationwide can search or scan meals.
   - **Verified Campus Mode**: Unlocks real-time canteen menus, live stall availability, and exact Firestore prices behind physical QR verification.
2. **Physical QR Access Protocol**: Selecting a college from a dropdown does **not** grant access. Official QR codes deployed at physical campus locations verify legitimate students.
3. **Database = Verified Facts | AI = Reasoning**: Generative AI evaluates nutrition and recommends Smart Swaps, but **never fabricates** campus prices or menu availability. All prices and stock status are grounded in verified database records.
4. **Multi-Campus Architecture**: Scalable isolation via `campusId`. **Maharaja Agrasen Institute of Technology (MAIT), Rohini, Delhi** is the official pilot institution.
5. **No Marketing Hype / Honest Metrics**: All impact metrics (money saved, estimated carbon avoided) are derived exclusively from actual user Smart Swap logs. When a user has 0 logs, the platform displays an honest empty state: *"Your weekly impact will appear here after your first Smart Swap."*

---

## ?? Tech Stack

- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Routing**: React Router DOM (v7)
- **Backend & Identity**: Firebase Authentication (Email/Password, Google OAuth, Anonymous Guest), Cloud Firestore, Firebase Storage
- **AI Intelligence**: Google Gemini API multimodal integration + Offline Indian Food Knowledge Base fallback
- **Security**: Granular Cloud Firestore Security Rules, Role-Based Access Control (Student vs Campus Admin)
- **Documentation**: 
  - [`docs/ECOBITE_CONTEXT.md`](docs/ECOBITE_CONTEXT.md) — Master product context and architecture
  - [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) — Firebase configuration & collection guides
  - [`docs/MAIT_DATA.md`](docs/MAIT_DATA.md) — Official MAIT canteen dataset & stall mappings
  - [`docs/AI_ARCHITECTURE.md`](docs/AI_ARCHITECTURE.md) — Gemini multimodal architecture & system prompts
  - [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) — Complete security review, rules audit & threat model

---

## ?? Core Features

### 1. Multimodal AI Food Analysis (Body / Wallet / Planet)
- **Multimodal Scanning**: Students can scan or take photos of food dishes, upload images, or search by dish name.
- **3-Dimensional Evaluation**:
  - **BODY (Health 0-10)**: Calories, macronutrients (protein, carbs, fat), dietary cautions (e.g. refined flour, high sodium).
  - **WALLET (Affordability 0-10)**: Estimated typical price tier for Indian college budgets.
  - **PLANET (Sustainability 0-10)**: Estimated carbon footprint (kg CO2e) and water impact.

### 2. Campus-Aware Smart Swaps (Pilot: MAIT)
- When a verified MAIT student analyzes a less healthy or expensive dish (e.g. Chole Bhature ?75 or Chowmein ?60), EcoBite scans real MAIT canteen menus (Main Canteen, Mini Canteen, Nescafe, Juice Corner).
- Recommends healthier, high-value alternatives actually available at that exact campus (e.g. Paneer Sandwich ?30, Rajma Rice ?40, Vegetable Poha ?25).
- Displays exact money saved and nutritional delta.

### 3. Persistent Smart Swap & Impact Logging
- Accepting a Smart Swap logs the event to Firestore (`/impactLogs`) and mirrors to isolated user local storage.
- Records `userId`, `campusId`, `originalFood`, `selectedAlternative`, `originalPrice`, `alternativePrice`, `moneySaved`, and `estimatedImpact`.
- Monetary savings are computed deterministically from verified prices.

### 4. Real Weekly Impact Dashboard
- Visualizes actual student metrics over time: total ? saved, meals swapped, estimated CO2 avoided.
- Displays dynamic savings trajectory chart and a chronological log of verified swaps.
- Strict empty-state guarantee when no swaps have been accepted yet.

### 5. MAIT Canteen Admin Dashboard (`/admin`, `/admin/mait`)
- Dedicated administrative interface for authorized campus cafeteria operators (`role: 'campus_admin'`, `campusId: 'MAIT'`).
- Live stall overview across MAIT's 4 canteens: Main Canteen, Mini Canteen, Nescafe, Juice Corner.
- Instant item editing: update prices (e.g. Paneer Sandwich from ?30 to ?35), toggle in-stock / sold-out availability, add new cafeteria dishes.
- **Instant Student-Facing Propagation**: Menu edits update immediately across student search, stall listings, and Smart Swap recommendations without any hardcoded fallbacks.
- **403 Security Guard**: Access denied for unauthenticated or non-admin students. Includes an Evaluator Demo Switch for rapid role testing by hackathon judges.

---

## ?? Project Structure

```
ecobite/
+-- docs/
¦   +-- ECOBITE_CONTEXT.md       # Master architectural specification
¦   +-- FIREBASE_SETUP.md        # Firebase console and collection guide
¦   +-- MAIT_DATA.md             # Ground-truth MAIT canteen dataset
¦   +-- AI_ARCHITECTURE.md       # Gemini prompt engineering & pipeline
¦   +-- SECURITY_AUDIT.md        # Complete security audit and rules review
+-- public/                      # Static assets and demo verification QRs
+-- src/
¦   +-- components/              # Shared UI components (Navbar, MobileNav, Card, Badge, etc.)
¦   +-- context/                 # AuthContext and state providers
¦   +-- data/                    # Pilot datasets and mock knowledge base
¦   +-- firebase/                # Firebase SDK client initialization
¦   +-- hooks/                   # Custom React hooks (useAuth, useCampusAccess)
¦   +-- layouts/                 # Root application shell & mobile navigation
¦   +-- pages/                   # Application views:
¦   ¦   +-- HomePage.tsx         # Universal landing & fast search
¦   ¦   +-- SearchPage.tsx       # Food search with 3D ratings
¦   ¦   +-- FoodAnalysisPage.tsx # AI Body / Wallet / Planet analysis
¦   ¦   +-- SmartSwapPage.tsx    # Campus-grounded Smart Swap decision
¦   ¦   +-- WeeklyImpactPage.tsx # Real user savings & carbon avoided
¦   ¦   +-- CampusAccessPage.tsx # Physical QR scanner & MAIT stall menus
¦   ¦   +-- AdminDashboardPage.tsx # Canteen manager price & stock dashboard
¦   ¦   +-- ProfilePage.tsx      # Student settings & session state
¦   ¦   +-- ContextPage.tsx      # In-app architecture & product docs
¦   +-- services/                # Backend connectors:
¦   ¦   +-- aiService.ts         # Gemini AI multimodal food analyzer
¦   ¦   +-- authService.ts       # Firebase Authentication connector
¦   ¦   +-- campusService.ts     # QR verification & token validation
¦   ¦   +-- impactService.ts     # Impact & swap decision persistence
¦   ¦   +-- menuService.ts       # Canteen catalogs & dynamic admin overrides
¦   +-- types/                   # TypeScript interfaces (Firestore schema)
¦   +-- utils/                   # Formatter functions (currency, carbon metrics)
+-- .env.example                 # Safe environment variable template
+-- firestore.rules              # Cloud Firestore security rules
+-- storage.rules                # Firebase Storage security rules
+-- package.json                 # Dependencies and npm scripts
+-- vite.config.ts               # Vite configuration
```

---

## ? Getting Started

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

---

## ?? Evaluator Verification Guide

### Scenario A: Public General Mode (Any Student Nationwide)
1. Navigate to `/` or `/search`.
2. Search for `Chole Bhature` or click **Scan Food** at `/scan`.
3. View the 3D analysis: **BODY** (3.5/10), **WALLET** (7.2/10), **PLANET** (5.8/10).
4. Notice that MAIT canteen prices are protected and not shown.
5. Visit `/impact`. Notice the genuine empty state: *"Your weekly impact will appear here after your first Smart Swap."*

### Scenario B: Campus Verification (MAIT Pilot)
1. Navigate to `/campus` and click **Verify Campus Access**.
2. Scan the official MAIT QR code (or click "Use Demo Verification Token").
3. Verification unlocks: **Main Canteen**, **Mini Canteen**, **Nescafe**, and **Juice Corner**.
4. Real MAIT canteen items and prices are now unlocked.

### Scenario C: Smart Swap & Real Impact Logging
1. From `/scan` or `/search`, analyze `Chole Bhature`.
2. Click **Find Smart Swap on Campus**.
3. EcoBite queries MAIT's catalog and recommends **Paneer Sandwich (Main Canteen)** at ?30 or **Vegetable Poha (Mini Canteen)** at ?25.
4. Click **Accept Swap & Log Savings**.
5. Navigate to `/impact`. Notice the real ?45 savings, CO2 reduction, and persistent log entry!

### Scenario D: Canteen Admin Price Edit & Immediate Student Propagation
1. Navigate to `/admin` or click **MAIT Admin** in the navigation bar.
2. If currently logged in as a normal student, an access denial screen (403 Forbidden) appears.
3. Click the **Evaluator Demo Switch** to switch into `campus_admin` role.
4. Locate **Paneer Sandwich** (Main Canteen) and click **Edit**.
5. Change the price from **?30** to **?35** and save.
6. Open `/campus` or re-run a Smart Swap: notice that Paneer Sandwich immediately displays the updated verified price of **?35**!
