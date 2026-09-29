# EcoBite AI — Menu Ingestion & Dynamic Campus Publishing Architecture

## Overview
EcoBite AI is a nationwide **Campus Food Decision & Student Demand Intelligence Platform**. 
Rather than relying on preloaded static menus, EcoBite empowers any college cafeteria or canteen manager to onboard their campus, upload physical menu photos or digital price lists, review AI-extracted items, edit details, and publish verified menus instantly for enrolled students.

```
┌─────────────────────────┐
│ Canteen Manager Upload  │ (PNG, JPG, WEBP, or PDF)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Gemini Vision Ingestion │ (Structured OCR, Price Normalization, Category Classification)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Manager Review Table   │ (Human-in-the-loop: Edit names, set prices, toggle stock, add items)
└─────┬──────────────┬────┘
      │              │
[ Save Draft ]  [ Confirm & Publish ]
      │              │
      ▼              ▼
┌───────────┐  ┌───────────────────────────────────────┐
│ status:   │  │ status: 'PUBLISHED', verified: true   │
│ 'DRAFT'   │  │ (Cloud Firestore `menuItems` & cache) │
└─────┬─────┘  └───────────────────┬───────────────────┘
      │                            │
  (HIDDEN from Students)           ▼
                       ┌───────────────────────┐
                       │ Student Campus Access │ (Scans campus QR & sees dynamic published menu)
                       └───────────────────────┘
```

---

## 1. Core Architectural Pillars

### A. AI is an Assistant; Manager Review is the Authority
- AI extraction never automatically publishes to the student catalog.
- Extracted items are placed into an interactive review table where the manager retains full authority to:
  - Correct dish names
  - Assign canonical food categories (`MEAL`, `SNACK`, `BEVERAGE`, `DESSERT`, `OTHER`)
  - Supply missing or unclear prices
  - Toggle stock availability
  - Add newly cooked specials or manual items

### B. Strict Draft vs. Published Boundary
- Saving a draft assigns `status: 'DRAFT'` and `verified: false`.
- The student query function `menuService.getPublishedMenu(campusId)` strictly filters for `status === 'PUBLISHED'` and `available === true`.
- Draft items are structurally invisible to students and search indexing until the manager explicitly clicks **[ Confirm & Publish ]**.

### C. Zero Price Hallucination Policy
- AI extraction normalizes raw text prices (e.g., `₹40`, `Rs. 40/-`, `40.00 only` $\to$ `40`).
- If a price is obscured, cropped, or ambiguous, the engine outputs `price: null` and marks the item `needsReview: true`.
- The manager is warned prior to publishing if any item lacks a verified price.

---

## 2. Canonical Food Categories
To prevent nonsensical cross-category swap recommendations on the student portal, dishes are classified into five strict canonical categories:

| Category | Description | Examples |
|---|---|---|
| **MEAL** | Hearty, full-portion main dishes | Rajma Chawal, Chole Bhature, Thali, Dal Roti, Fried Rice, Chowmein, Biryani, Pasta |
| **SNACK** | Quick bites, small plates, finger food | Sandwiches, Burgers, Samosas, Patties, Momos, Fries, Maggi, Bread Rolls |
| **BEVERAGE** | Hot drinks, cold drinks, juices, shakes | Chai, Filter Coffee, Cold Coffee, Fresh Juices, Lassi, Chaas, Nimbu Pani |
| **DESSERT** | Sweets, ice-creams, bakery confections | Gulab Jamun, Pastries, Fruit Chill, Kulfi, Brownies, Ice Cream |
| **OTHER** | Combos, packaging, or unclassified items | Carry Bags, Meal Combos, Extras |

---

## 3. Data Schema

### A. `menuUploads` Collection (Firestore: `menuUploads/{uploadId}`)
```typescript
interface MenuUploadDoc {
  uploadId: string;
  campusId: string;          // e.g. 'MAIT', 'DTU'
  canteenId: string;         // e.g. 'main-canteen'
  uploadedBy: string;        // Manager UID or email
  originalFileName: string;
  fileType: string;
  fileUrl?: string;
  status: 'PROCESSING' | 'DRAFT' | 'REVIEW_REQUIRED' | 'PUBLISHED' | 'FAILED';
  extractedItemCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### B. `menuItems` Collection (Firestore: `menuItems/{menuItemId}`)
```typescript
interface MenuItemDoc {
  menuItemId: string;        // e.g. 'dtu-main-canteen-chole-kulche'
  campusId: string;          // Campus isolation key
  canteenId: string;
  name: string;
  category: string;
  foodCategory?: FoodCategory;
  price: number | null;
  available: boolean;
  description: string;
  verified: boolean;
  source: 'manager_published' | 'ai_extraction_draft';
  status: 'DRAFT' | 'PUBLISHED';
  extractionConfidence?: number;
  needsReview?: boolean;
  createdAt?: string;
  updatedAt: string;
}
```

---

## 4. Multi-Campus Isolation & QR Generation
1. Each manager account is linked to an institution code (e.g. `MAIT`, `DTU`, `NSUT`).
2. When the manager publishes a menu, items are indexed under that `campusId`.
3. The manager generates a campus QR code encoding the verification access link:
   ```
   https://pra27-06.github.io/ecobite/campus?campus=DTU&qr=DTU-01
   ```
4. When enrolled students scan the counter QR, the system verifies campus premises and queries `menuService.getPublishedMenu('DTU')`, delivering real-time authentic menu items with zero cross-campus leakage.

---

## 5. Verification & Automated Test Suite
The architecture is verified via `scripts/test_menu_ingestion.cjs`:
- **Test 1**: Price parsing (`₹40`, `Rs. 50/-`, `35.00 only`) and canonical category classification.
- **Test 2**: Strict draft isolation (draft items never returned by `getPublishedMenu`).
- **Test 3**: Manager confirmation and publishing lifecycle.
- **Test 4**: Cross-campus catalog isolation.
