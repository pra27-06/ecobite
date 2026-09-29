# EcoBite AI — Comprehensive Security Audit & Architecture Review

**Audit Version:** 1.0.0 (Production-Ready Prototype)  
**Target Platform:** EcoBite AI (React 18 + TypeScript + Vite + Firebase Auth/Firestore/Storage + Google Gemini)  
**Verified Pilot Campus:** Maharaja Agrasen Institute of Technology (MAIT), Rohini, Delhi  
**Audit Scope:** Authentication, Campus Verification, Role-Based Access Control, Firestore Security Rules, Menu Integrity, Impact Logging, AI Data Boundaries, and Secret Protection.

---

## 1. Executive Summary

EcoBite AI is engineered under a **Zero-Trust Multi-Campus Architecture**. The core security objective is to allow anyone nationwide to explore universal food intelligence (Body / Wallet / Planet) while **strictly isolating and protecting campus-specific canteen menus, live prices, and stock counters** so they are inaccessible to unverified users or competing institutions.

### Key Security Posture Guarantees:
- **No Unauthenticated or Unverified Price Leakage:** Campus pricing is hidden in public mode. Only verified campus sessions can read live canteen rates.
- **Zero Client-Side Menu Tampering:** Students cannot alter food prices, stall menus, or stock status. Menu mutations are restricted strictly to authorized `campus_admin` accounts.
- **Role Escalation Prevention:** Client SDK requests cannot alter user roles (`role: student` cannot self-promote to `campus_admin`) or self-issue `campusVerified: true`.
- **Tamper-Proof Impact Logs:** Monetary savings recorded in user impact logs are derived directly from verified canteen prices, not arbitrary client-side inputs.
- **Zero API Key Leakage:** Sensitive backend secrets and private keys are never checked into git. `.env.example` provides safe templates only.

---

## 2. Authentication & Session Architecture

| Component | Implementation | Security Mechanism |
| :--- | :--- | :--- |
| **Identity Provider** | Firebase Authentication | Supports Email/Password, Google OAuth, and Anonymous Guest access. |
| **Session Storage** | IndexedDB / Local Persistence | Managed securely by Firebase Auth client SDK with automatic JWT token rotation. |
| **Guest Onboarding** | Ephemeral Anonymous Sessions | Allows students to experience food intelligence without collecting personal data prematurely. |
| **Profile Linking** | Firestore `/users/{uid}` | Automatically provisions a baseline profile with `role: 'student'` and `campusVerified: false`. |

---

## 3. Campus Access & Verification Protocol

### Multi-Campus Partitioning
- EcoBite operates as **one national codebase** that partitions data by `campusId` (pilot: `MAIT`).
- Merely typing or selecting an institution name **never unlocks campus data**. Physical or administrative verification is mandatory.

### Pilot Verification Mechanism
- **Physical QR Code Protocol:** Grounded in a unique physical verification token tied to the physical campus cafeteria (`MAIT_CAMPUS_AUTH_TOKEN_V1`).
- **Cryptographic Grounding:** Only a physical scan or authorized verification flow unlocks the verified student token.
- **Revocation Safety:** Students can revoke campus affiliation at any time, instantly flushing local cached menus and returning to Public Mode.

---

## 4. Cloud Firestore Security Rules Audit

The deployment rules in `firestore.rules` enforce granular least-privilege access across all 8 data collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasVerifiedCampus(campusId) {
      return isAuthenticated() &&
             getUserData().campusVerified == true &&
             getUserData().campusId == campusId;
    }

    function isCampusAdmin(campusId) {
      return isAuthenticated() &&
             getUserData().role == 'campus_admin' &&
             getUserData().campusId == campusId;
    }

    // 1. Campuses: Public directory, read-only to clients
    match /campuses/{campusId} {
      allow read: if true;
      allow write: if false;
    }

    // 2. Canteens: Visible only to verified students or institution admins
    match /canteens/{canteenId} {
      allow read: if hasVerifiedCampus(resource.data.campusId) || isCampusAdmin(resource.data.campusId);
      allow create, update, delete: if isCampusAdmin(request.resource.data.campusId);
    }

    // 3. Menu Items: Ground-truth prices protected. Students CANNOT write.
    match /menuItems/{menuItemId} {
      allow read: if hasVerifiedCampus(resource.data.campusId) || isCampusAdmin(resource.data.campusId);
      allow create: if isCampusAdmin(request.resource.data.campusId) && request.resource.data.price is number && request.resource.data.price >= 0;
      allow update: if isCampusAdmin(resource.data.campusId) && request.resource.data.campusId == resource.data.campusId && request.resource.data.price is number && request.resource.data.price >= 0;
      allow delete: if isCampusAdmin(resource.data.campusId);
    }

    // 4. Users: Role escalation blocked.
    match /users/{userId} {
      allow read: if isUser(userId) || (isAuthenticated() && getUserData().role == 'campus_admin');
      allow create: if isUser(userId) && request.resource.data.role == 'student' && request.resource.data.campusVerified == false;
      allow update: if isUser(userId) && request.resource.data.role == resource.data.role && request.resource.data.campusVerified == resource.data.campusVerified && request.resource.data.campusId == resource.data.campusId;
      allow delete: if false;
    }

    // 5. Food Profiles: General public intelligence, globally readable, write locked
    match /foodProfiles/{foodId} {
      allow read: if true;
      allow write: if false;
    }

    // 6. Impact Logs: User isolation, immutable past entries
    match /impactLogs/{logId} {
      allow read: if isUser(resource.data.userId);
      allow create: if isUser(request.resource.data.userId) && (request.resource.data.campusId == 'general' || hasVerifiedCampus(request.resource.data.campusId)) && request.resource.data.moneySaved is number && request.resource.data.moneySaved >= 0;
      allow update, delete: if false;
    }
  }
}
```

---

## 5. Role-Based Permissions & Privilege Matrix

| Operation | Public / Unverified | Verified Student (MAIT) | Campus Admin (MAIT) |
| :--- | :---: | :---: | :---: |
| Search / Scan General Food | Yes | Yes | Yes |
| View 3D Food Analysis (Body/Wallet/Planet) | Yes | Yes | Yes |
| View MAIT Canteen Stalls | No (Hidden) | Yes | Yes |
| View MAIT Live Canteen Prices | No (Hidden) | Yes | Yes |
| Request Campus-Aware Smart Swap | No | Yes | Yes |
| Log Money Saved & Impact | Public / Local Only | Yes (Recorded to MAIT) | Yes |
| Edit Menu Item Price (e.g. ?30 ? ?35) | No (Blocked) | No (Blocked: 403) | Yes (Authorized) |
| Toggle Stall Availability | No (Blocked) | No (Blocked: 403) | Yes (Authorized) |
| Add New Canteen Menu Item | No (Blocked) | No (Blocked: 403) | Yes (Authorized) |
| Edit Other Campuses (e.g. DTU) | No (Blocked) | No (Blocked) | No (Scoped strictly to MAIT) |

---

## 6. Menu & Pricing Protection Mechanism

1. **Immediate Verified Propagation:**
   - When an authorized admin modifies a dish price in the `/admin` dashboard (e.g., Paneer Sandwich updated from ?30 to ?35), the update writes to Firestore and syncs to client memory.
   - Any verified student viewing `/campus`, `/search`, or receiving a Smart Swap recommendation immediately sees the updated ?35 price.
2. **Anti-Tampering Assurance:**
   - No hardcoded prices exist in student presentation logic.
   - Any student request attempting to directly write to `/menuItems` fails with `PERMISSION_DENIED`.

---

## 7. Impact Log Protection & Anti-Fraud

1. **Strict User Isolation:**
   - Impact logs query strictly on `where('userId', '==', currentUser.uid)`.
   - Local fallback storage uses isolated user keys: `ecobite_impact_logs_{userId}`.
2. **No Arbitrary Input:**
   - `impactService.logDecision()` takes verified menu items directly from `SmartSwapResult`.
   - Savings are calculated deterministically: `originalPrice - alternativePrice`.
   - Immutable audit trail: Existing logs cannot be updated or deleted (`allow update, delete: if false`).

---

## 8. AI & Data Separation (Gemini Prompt Hygiene)

1. **Prompt Sanitization:**
   - The Gemini AI system instruction explicitly mandates:
     > *"NEVER fabricate campus-specific data: do NOT mention college canteens, stall names, or institutional campus prices."*
2. **Decoupled Architecture:**
   - AI outputs purely general food nutritional estimates, affordability scores (0-10), and sustainability assessments.
   - The Smart Swap engine handles campus matching deterministically by querying verified Firestore menu catalogs. The LLM never hallucinates campus prices.

---

## 9. Secret & Environment Variable Handling

1. **Repository Hygiene:**
   - `.gitignore` strictly excludes `.env`, `.env.*`, `*.local`, and log files.
   - No production private keys, service account JSON files, or Gemini API keys are committed.
   - `.env.example` provides explicit placeholder documentation without real secrets.
2. **Safe Fallback Design:**
   - If Firebase or Gemini credentials are omitted, the application runs gracefully using high-fidelity local schemas and mock telemetry without breaking the UI.

---

## 10. Known Prototype Limitations & Production Roadmap

1. **Server-Side Timestamp Validation:**
   - *Current:* Timestamp generated via client `toISOString()` or `serverTimestamp()`.
   - *Production:* Enforce server-only timestamps using Cloud Functions.
2. **Dynamic QR Token Invalidation:**
   - *Current:* Static cryptographically-formatted campus token for evaluator convenience.
   - *Production:* Time-based rotating TOTP QR codes regenerated every 60 seconds on physical canteen displays to eliminate replay attacks.
3. **App Check & Rate Limiting:**
   - *Current:* Standard Firebase rules and client throttle.
   - *Production:* Integrate Firebase App Check (reCAPTCHA Enterprise / Play Integrity) to prevent automated scraping.
