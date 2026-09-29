# EcoBite AI — Master Project Context & Architecture

> **Document Version:** 1.0.0  
> **Status:** Active Reference Architecture  
> **Target Audience:** Engineering, AI Pair Programming Agents, Product & Hackathon Evaluators

---

## 1. Product Vision

**EcoBite AI** is an AI-powered food intelligence and decision platform specifically engineered for Indian college students. 

College students in India make daily food decisions under severe constraints: tight pocket allowances, irregular hostel schedules, limited canteen options, and peer habits skewed towards deep-fried or ultra-processed snacks. Simultaneously, canteen food waste, unmonitored carbon footprints, and nutritional imbalances go largely unnoticed.

EcoBite AI bridges this gap by turning every meal choice into an informed, empowered decision:
- Evaluating food on three synchronized dimensions: **Health**, **Affordability**, and **Sustainability**.
- Grounding AI recommendations strictly in verified campus canteen realities.
- Demonstrating tangible, cumulative student savings and ecological impact over time.

---

## 2. User Journey

The end-to-end student flow is structured as follows:

```
[Student arrives on EcoBite AI]
               │
               ▼
   [General Public Mode]
   • Search or scan any dish / food item
   • View nutrition score, price tier & CO₂ footprint
   • General guidance available nationwide
               │
               ├────────────────────────────┐
               │ Unverified                 │ Physical QR Scanned
               ▼                            ▼
   [Campus Protected Prompt]      [Verified Campus Mode]
   "Scan your canteen's QR code    • Session unlocks verified campus (e.g. MAIT)
    to view live stall prices"     • Fetches real Firestore canteen menus & prices
                                   • Recommends ground-truth Smart Swaps
                                   • Logs verified savings (₹) and CO₂ offset
```

1. **Discovery / Search**: Student types a food item (e.g., *"Samosa"*, *"Chole Bhature"*, *"Maggi"*) or uses camera scan.
2. **Analysis**: Receives immediate nutritional breakdown, calorie estimate, health score, affordability tier, and carbon footprint.
3. **Campus Contextualization**:
   - If not verified: sees general benchmark figures with a call-to-action to verify their campus.
   - If verified: the app loads their verified campus canteens and live items.
4. **Smart Swap Suggestion**: Recommends a verified healthier/cheaper alternative currently available at their campus canteen (e.g. swapping a ₹20 deep-fried item for a ₹30 high-protein Paneer Sandwich at MAIT with explicit net nutritional gain).
5. **Impact Confirmation**: Student confirms or logs the choice, updating their personal money-saved tally (₹) and carbon-avoided metrics.

---

## 3. General Mode (Public Layer)

The **General Mode** is open to all users nationwide without requiring campus credentials or physical QR verification:

- **Universal Availability**: Anyone can open the web app from anywhere.
- **Broad Food Intelligence**: Contains comprehensive nutritional profiles and carbon footprint models for popular Indian dishes, street food, snacks, and packaged foods.
- **Macro & Micro Insights**: Displays estimated calories, macronutrients (proteins, carbs, fats), glycemic indicators, and health ratings (1–100 scale).
- **Environmental Impact**: Computes carbon footprint estimates (kg CO₂e per serving) based on ingredient lifecycle benchmarks.
- **Privacy Boundary**: General Mode **never exposes** internal campus canteen menus, stall names, proprietary institutional contracts, or specific college prices.

---

## 4. Verified Campus Mode (Protected Layer)

The **Verified Campus Mode** is the privileged tier that unlocks localized campus operations:

- **Restricted Access**: Activated strictly via verified campus credentials/QR tokens.
- **Ground-Truth Menu & Prices**: Directly displays verified dishes, current counter availability, and exact prices from Cloud Firestore.
- **Stall & Counter Transparency**: Highlights specific locations within campus (e.g. *Main Canteen*, *Nescafe Booth*, *Mini Canteen*).
- **Personalized Smart Swaps**: AI recommendations suggest only items that actually exist and are currently available in that specific campus's Firestore catalog.

---

## 5. Campus QR Access Concept

### Why QR Verification?
College food services operate with dynamic institutional pricing, subsidized items, and canteen vendor agreements. Merely selecting an institution name from a public dropdown exposes private campus data and risks fraudulent logging.

### Access Verification Rules:
1. **Physical Presence Binding**: Official EcoBite QR codes are placed physically within campus dining halls, canteens, and official student noticeboards.
2. **Cryptographic / Identifier Payload**: The QR contains a secure campus token (e.g., `ecobite://verify?campus=mait&key=...`).
3. **Dropdown Selection Exclusion**: A public dropdown menu for campus selection is **strictly prohibited** from granting access to protected campus menus. Selecting a college from a list only provides general institutional info, never the live canteen database.
4. **Session Persistence**: Once scanned, the verified campus status is securely maintained in the user's session/profile state.

---

## 6. Multi-Campus Architecture

EcoBite AI is designed as **one unified national platform** that scales across hundreds of campuses through strict database tenant isolation:

```
                     ┌───────────────────────────┐
                     │    EcoBite Core Engine    │
                     └─────────────┬─────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
     [Public Food Intelligence]           [Multi-Campus Isolation]
     • Nutrition DB                       • Partitioned by campusId
     • Carbon Models                      • Strict Access Guard
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
                 campus: mait                   campus: dtu                    campus: nsut
              (Pilot - Live Data)            (Schema Ready)                 (Schema Ready)
```

- Every campus-specific document in Firestore includes a mandatory foreign key `campusId`.
- No campus data is hardcoded into frontend components.
- Onboarding new colleges (e.g., DTU, NSUT, IIT Delhi) requires only creating new Firestore campus records—zero code changes or frontend redeployments needed.

---

## 7. Firebase Architecture

EcoBite leverages Firebase as a unified serverless ecosystem:

- **Firebase SDK & Initialization**: Environment-variable-backed (`src/firebase/config.ts`) supporting modular tree-shaking and automated graceful fallback when running in unconfigured or local demo mode.
- **Firebase Authentication**: Manages student identity (Email/Password authentication, anonymous frictionless guest sessions, and authenticated user documents synchronized in Firestore `users/{userId}`).
- **Cloud Firestore**: High-performance NoSQL document store housing verified campus facts, partitioned strictly by `campusId`.
- **Firebase Storage**: Secure object store for dish photographs (`userScans/{userId}`) and official canteen menu boards (`campusBoards/{campusId}/{canteenId}`).
- **Firestore Security Rules (`firestore.rules`)**: Server-side enforcement ensuring students only read campus data matching their verified access token, strictly prohibiting client-side price modification, role escalation, or unauthorized cross-campus queries.
- **Firebase Storage Rules (`storage.rules`)**: Restricts food scan uploads to authenticated owners with image MIME and 5MB size limits, while protecting official menu boards to verified institution administrators.
- **Service Layer Abstraction (`src/services/`)**: Components never make raw Firestore/Storage calls directly; all operations pass through dedicated typed service modules (`authService`, `campusService`, `menuService`, `foodService`, `impactService`, `storageService`).

---

## 8. Firestore Data Model

The Firestore schema enforces separation between universal facts and campus-specific records:

### Collections Schema:

#### `campuses`
```typescript
{
  id: "mait",                                    // Unique campus slug
  name: "Maharaja Agrasen Institute of Technology",
  shortName: "MAIT",
  city: "Delhi",
  isActive: true,
  officialQrCodeIdentifier: "MAIT_MAIN_2026",
  canteensCount: 2,
  createdAt: Timestamp
}
```

#### `canteens`
```typescript
{
  id: "mait_main_canteen",
  campusId: "mait",
  name: "Main Canteen",
  location: "Block 1 Ground Floor",
  isOpen: true,
  openingHours: "08:30 - 17:00"
}
```

#### `menuItems`
```typescript
{
  id: "mait_paneer_sandwich",
  campusId: "mait",
  canteenId: "mait_main_canteen",
  name: "Paneer Sandwich",
  category: "snacks",
  price: 30,                                     // Verified price in INR
  isAvailable: true,
  caloriesApprox: 240,
  tags: ["vegetarian", "high-protein"],
  updatedAt: Timestamp
}
```

#### `users`
```typescript
{
  uid: "firebase_user_uid",
  email: "student@mait.ac.in",
  displayName: "Student Name",
  verifiedCampusId: "mait",
  verifiedAt: Timestamp,
  createdAt: Timestamp
}
```

#### `campusAccess`
```typescript
{
  id: "access_record_id",
  userId: "firebase_user_uid",
  campusId: "mait",
  accessGrantedAt: Timestamp,
  accessMethod: "qr_scan",
  isActive: true
}
```

#### `foodProfiles` (Universal Public Intelligence)
```typescript
{
  id: "food_samosa",
  name: "Samosa",
  category: "Street Food / Snacks",
  healthScore: 32,
  nutritionSummary: {
    protein: "3.5g",
    carbs: "32g",
    fats: "17g",
    estimatedCalories: 260
  },
  sustainabilityScore: 45,
  carbonFootprintKgCo2: 0.38,
  healthPros: ["Quick energy"],
  healthCons: ["Deep fried", "High refined carbohydrates", "High trans fats"]
}
```

#### `smartSwaps` & `impactLogs`
```typescript
{
  id: "log_12345",
  userId: "firebase_user_uid",
  campusId: "mait",
  timestamp: Timestamp,
  originalFood: "Samosa",
  swappedMenuItemId: "mait_paneer_sandwich",
  moneySaved: 10,                                // INR
  co2ReducedGrams: 120                           // Grams CO2e
}
```

---

## 9. AI Role & Core Data Principle

### The Core Invariant:
$$\text{Database} = \textbf{Verified Facts} \quad \Big| \quad \text{AI} = \textbf{Reasoning \& Analysis}$$

### Strict Principles:
1. **Zero Price Hallucination**: AI must **NEVER** fabricate or guess a campus price. If Firestore records a *Paneer Sandwich* at MAIT for ₹30, the AI must strictly cite ₹30.
2. **Catalog Bounding**: When generating Smart Swaps in Verified Campus Mode, the AI receives verified Firestore menu items in its system prompt/context and is forbidden from recommending off-menu items.
3. **Nutritional Inference**: Gemini Vision / Gemini API inspects food imagery or natural language dish queries to analyze nutritional density, health implications, and carbon coefficients.
4. **Transparent Explanations**: Recommendations provide concise, relatable rationales for college students (e.g., *"Provides 12g extra protein for just ₹10 more, keeping you energized through afternoon labs"*).

---

## 10. Smart Swap Concept

A **Smart Swap** is an intelligent intervention recommended at the point of decision:
- **Heuristic**: Evaluates the student's selected craving against the live campus canteen roster.
- **Optimization Triangle**:
  1. *Healthier*: Lower trans fats, higher dietary fiber/protein, balanced glycemic index.
  2. *Affordable*: Equal or comparable price tier within student budget boundaries.
  3. *Sustainable*: Lower carbon and water footprint ingredients (e.g. seasonal local produce).
- **Direct Canteen Routing**: Tells the student exactly which counter has the item in stock.

---

## 11. Admin & Vendor Concept

To maintain reliable ground truth without manual developer updates:
- **Campus Admin / Canteen Manager Role**: Authorized canteen operators log in to toggle daily availability (`isAvailable: true/false`).
- **Dynamic Price Revisions**: Canteens can adjust prices directly through their dashboard, instantly propagating to the Firestore cache.
- **Audit Trails**: Every price modification records an admin ID and timestamp for institutional accountability.

---

## 12. Security Principles

1. **Client Isolation**: API keys with privileged permissions (e.g. Firebase Admin SDK, Gemini Service Roles) are never shipped in the browser bundle.
2. **Environment Variable Guarding**: Public frontend tokens (`VITE_FIREBASE_*`) are locked by Firebase Security Rules and domain whitelisting.
3. **Firestore Rule Gating**: Canteen menu modification is restricted strictly to verified campus admin claims. Reading menu items requires either public flag or verified campus verification token.
4. **No Fake Data Ingestion**: No dummy pricing or speculative canteen listings are allowed in code or database.

---

## 13. Current Prototype Scope

| Component | Prototype Status | Notes |
|:---|:---|:---|
| **Frontend Shell** | Completed | React + Vite + Tailwind CSS + Lucide React + Routing |
| **Student UI Screens** | Completed | Home, Campus, Scan, Search, Analysis, Smart Swap, Impact, Profile |
| **Architectural Docs** | Completed | `/docs/ECOBITE_CONTEXT.md`, `/docs/FIREBASE_SETUP.md`, `/docs/MAIT_DATA.md`, `/docs/AI_ARCHITECTURE.md` |
| **Firebase Platform** | Completed | Auth, Firestore, Storage, Service Layers, Security Rules (`firestore.rules`, `storage.rules`) |
| **Pilot Campus Dataset** | **Completed: MAIT** | 4 verified stalls (Amul, Food Mast, Juice Point, Nescafé), 75+ verified items from menu photos |
| **Campus Verification Gate** | Completed | Public mode hides stall prices; Verified Campus Mode unlocks authentic Firestore menus |
| **AI Food Analysis** | **Completed** | Multimodal Gemini Vision/Text with Body/Wallet/Planet evaluation & low-confidence handling |
| **Campus-Aware Smart Swap** | **Completed** | Transparent ranking engine bounded strictly to Firestore MAIT menu data |
| **Telemetry & Decision Logging**| Completed | `impactService.logDecision` records accepted swaps for student telemetry |
| **DTU / NSUT / Others** | Architecture Ready | Zero fake menus created; multi-tenant schema ready for authentic onboarding |
| **QR Verification Engine**| Future Stage | Camera QR scanner + token verification hook |

---

## 14. Future Expansion Roadmap

1. **Phase 1: Architecture, Frontend & Platform Foundation** *(Completed)*
   - National public mode vs. verified campus mode separation.
   - Comprehensive Firebase service layers, types, and security rules.

2. **Phase 2: MAIT Ground-Truth Dataset & Menu Explorer** *(Completed)*
   - Audited 4 real campus dining establishments at MAIT from physical menu boards.
   - 75+ authentic dishes cataloged with exact INR pricing, variants, and strict exclusion audit.
   - Interactive Canteen Catalog in Campus Access & Food Analysis screens.
   - Idempotent Firestore seeder (`npm run seed:mait`).

3. **Phase 3: AI Food Intelligence & Campus Smart Swaps** *(Completed)*
   - Centralized Gemini/Vision service (`aiService.ts`) with Indian food knowledge engine.
   - 3D evaluation: BODY (Health), WALLET (Affordability), PLANET (Sustainability).
   - Strict data separation: AI estimates nutrition; Firestore supplies ground-truth prices.
   - Transparent Smart Swap algorithm (`swapService.ts`) with `[ Accept Smart Swap ]` logging.

4. **Phase 4: Camera QR Scanner & Physical Access Layer** *(Upcoming)*
   - Integrate QR camera scanner for mobile devices.
   - Generate official printable MAIT canteen QR poster specimen.

5. **Phase 5: Student Impact Dashboard & Analytics** *(Upcoming)*
   - Cumulative monthly savings (₹) and CO₂ offset tracking.
   - Gamified sustainability milestones and campus leaderboard.

6. **Phase 6: Multi-Campus Pilot Rollout** *(Upcoming)*
   - Onboard neighboring Delhi/NCR institutions (DTU, NSUT, USICT) strictly with verified on-site menu datasets.


