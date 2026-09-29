# EcoBite AI — Firebase Backend & Platform Setup Guide

> **Document Version:** 1.0.0  
> **Target Audience:** Developers, Hackathon Judges, Cloud Administrators

---

## 1. Overview

EcoBite AI utilizes Firebase as a serverless backend ecosystem providing:
- **Firebase Authentication**: Student credentials (Email/Password & Anonymous Guest exploration).
- **Cloud Firestore**: Real-time NoSQL database housing multi-campus data, canteen rosters, and impact telemetry.
- **Firebase Storage**: Object storage for temporary meal scan uploads and canteen menu board photos.
- **Security Rules**: Multi-tenant authorization guards (`firestore.rules` and `storage.rules`) preventing unauthorized access to institutional canteen prices.

---

## 2. Environment Variables & Credentials

EcoBite AI is built with an **environment-isolated architecture**. Secrets and credentials must never be committed to source control.

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Populate `.env` with your project's Firebase Web App credentials:

```ini
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Gemini AI API Configuration (Scheduled for subsequent AI stage)
VITE_GEMINI_API_KEY=
```

> **Zero Crash Fallback**: If these environment variables are missing or unconfigured, the application runs automatically in safe local fallback mode, allowing evaluator UI inspection without throwing unhandled exceptions.

---

## 3. Firebase Console Setup Steps

### Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `ecobite-ai` (or your preferred name).
3. Disable Google Analytics for the prototype or keep default.
4. Click **Create project**.

### Step 2: Register Web Application
1. In the Project Overview page, click the **Web icon (`</>`)** to add a web app.
2. Register app as `ecobite-web`.
3. Copy the `firebaseConfig` object values into your local `.env` file as listed above.

### Step 3: Enable Firebase Authentication
1. In the Firebase console sidebar, navigate to **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Enable **Email/Password** (Email link optional).
   - Enable **Anonymous** (allows frictionless student exploration before physical campus verification).
4. Save the configuration.

### Step 4: Provision Cloud Firestore Database
1. Navigate to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Select a region close to your primary pilot (e.g. `asia-south1` for Mumbai / Delhi).
4. Start in **Production mode** (Rules will be applied via `firestore.rules`).
5. Deploy the security rules defined in [`firestore.rules`](../firestore.rules):
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 5: Provision Firebase Storage
1. Navigate to **Build** → **Storage**.
2. Click **Get Started**.
3. Choose a default bucket location (e.g. `asia-south1`).
4. Deploy the storage security rules defined in [`storage.rules`](../storage.rules):
   ```bash
   firebase deploy --only storage
   ```

---

## 4. Firestore Schema Collections

The Firestore structure enforces strict separation between universal public food facts and campus-private canteen data:

| Collection | Path | Description | Access Policy |
|:---|:---|:---|:---|
| **`campuses`** | `/campuses/{campusId}` | Metadata for participating universities (e.g., `mait`). | Public read; Admin SDK write only. |
| **`canteens`** | `/canteens/{canteenId}` | Canteen stalls & locations bound to a campus (`campusId`). | Verified campus students & campus admins only. |
| **`menuItems`** | `/menuItems/{menuItemId}` | Verified menu items, prices (₹), and availability. | Verified campus students & campus admins only. |
| **`users`** | `/users/{userId}` | Student profile documents & role assignments. | Owner read/write (role & verification immutable by client). |
| **`campusAccess`** | `/campusAccess/{accessId}` | Cryptographic / session verification records. | Owner read; Server write only. |
| **`foodProfiles`** | `/foodProfiles/{foodId}` | Universal Indian food nutrition & carbon models. | Public read; Admin SDK write only. |
| **`smartSwaps`** | `/smartSwaps/{swapId}` | Bounded recommendations tied to campus menus. | Verified campus students only. |
| **`impactLogs`** | `/impactLogs/{logId}` | Personal savings (₹) and carbon reductions (kg CO₂). | Owner read; Owner create (validated fields). |

---

## 5. Security Principles & Rule Enforcement

EcoBite AI enforces the following 10 security mandates directly in [`firestore.rules`](../firestore.rules):

1. **Zero Public Leakage of Campus Data**: Public users can explore general food intelligence (`foodProfiles`), but cannot read internal `canteens` or `menuItems`.
2. **Anti-Dropdown Spoofing**: Changing `campusId = 'MAIT'` to `campusId = 'DTU'` in the frontend client does not grant access. The security rule evaluates `getUserData().campusVerified == true && getUserData().campusId == resource.data.campusId`.
3. **Price Tamper Resistance**: Students can **never** create or update menu prices; only authenticated `campus_admin` accounts matching the campus can modify menu documents.
4. **Privilege Escalation Prevention**: On user registration and profile updates, the rules strictly prevent modifying `role` (cannot self-assign `campus_admin`) or `campusVerified` (cannot self-verify).
5. **Multi-Campus Tenant Isolation**: A `campus_admin` assigned to MAIT is prevented from modifying documents belonging to DTU or NSUT (`request.resource.data.campusId == resource.data.campusId`).
6. **Owner-Bound Impact Logs**: Students can only write impact logs where `request.resource.data.userId == request.auth.uid`.
7. **Document Field Validation**: Prices and savings must be positive numbers (`price >= 0`, `moneySaved >= 0`).
8. **Client Isolation**: Privileged operations (e.g. initial campus provisioning, token issuance) are reserved for backend admin credentials.
9. **Storage Quotas**: Student photo uploads are capped at 5 MB and restricted to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`).
10. **Menu Board Protection**: Official canteen signage photos are restricted to campus administrator write access.

---

## 6. Service Layer Architecture

The frontend communicates with Firebase exclusively via typed service abstractions in `src/services/`:

```
UI Components (HomePage, CampusAccess, FoodAnalysis, etc.)
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│               EcoBite Service Modules                  │
│                                                        │
│  • authService.ts     → Authentication & User Profiles │
│  • campusService.ts   → Campuses, Canteens, Access     │
│  • menuService.ts     → Menu items (Access Gated)      │
│  • foodService.ts     → Universal Food Profiles        │
│  • impactService.ts   → Decision & Savings Telemetry   │
│  • storageService.ts  → Managed file upload pipeline   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            Firebase SDK (`src/firebase/config.ts`)     │
│       [Auth]       [Cloud Firestore]       [Storage]   │
└────────────────────────────────────────────────────────┘
```

---

## 7. Local Development & Deployment

### Running the Frontend
```bash
# Start local development server with Vite
npm run dev
```

### Deploying Security Rules with Firebase CLI
```bash
# Login to Firebase CLI
firebase login

# Set your active project
firebase use your-project-id

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

---

## 8. Summary of Completed Foundation

- [x] Firebase Web SDK installed (`firebase@^11.x`).
- [x] Safe, tree-shakeable initialization with fallback in `src/firebase/config.ts`.
- [x] Typed AuthContext & `useAuth` hook.
- [x] Complete service layer (`authService`, `campusService`, `menuService`, `foodService`, `impactService`, `storageService`).
- [x] Production Firestore security rules (`firestore.rules`).
- [x] Production Storage security rules (`storage.rules`).
- [x] Rollup manual code splitting for Firebase vendor bundles.
- [x] Production build and linter passing with 0 errors.
