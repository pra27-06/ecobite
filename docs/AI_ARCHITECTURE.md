# EcoBite AI — AI Intelligence & Smart Swap Architecture

> **Document Version:** 1.0.0  
> **Status:** Active Reference Architecture  
> **Target Audience:** Engineering, AI Developers, Security Auditors, Hackathon Evaluators

---

## 1. Architectural Overview & Separation of Concerns

EcoBite AI enforces a **strict, non-negotiable data boundary** between statistical AI estimations and authoritative institutional facts:

```
┌─────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│           AI INTELLIGENCE LAYER         │       │        FIRESTORE FACT REPOSITORY        │
│          (Google Gemini / Vision)       │       │       (Audited Ground-Truth Data)       │
├─────────────────────────────────────────┤       ├─────────────────────────────────────────┤
│ • Multimodal dish & snack identification │       │ • Campus institutional metadata (MAIT)  │
│ • Nutritional composition approximation │       │ • Physical canteen stalls & counters    │
│ • Calorie, protein, carb, fat breakdown │       │ • Ground-truth INR (₹) item prices      │
│ • Health reasoning (BODY score: 0-10)   │       │ • Live inventory & stall availability   │
│ • Affordability tier (WALLET: 0-10)     │       │ • Verified student authorization tokens │
│ • Carbon footprint (PLANET: 0-10)       │       │ • Historical telemetry & impact logs    │
│ • Educational dietary cautions          │       │                                         │
└─────────────────────────────────────────┘       └─────────────────────────────────────────┘
                    │                                                  │
                    ▼                                                  ▼
          ┌──────────────────────────────────────────────────────────────────┐
          │                  ECOBITE SMART SWAP ENGINE                       │
          │                   (swapService.ts)                               │
          │                                                                  │
          │  Input: [AI Analysis] + [Firestore Verified Campus Menu]         │
          │  Output: Optimal Campus Alternative with Ground-Truth Pricing    │
          └──────────────────────────────────────────────────────────────────┘
```

### The Zero-Hallucination Guardrail:
- **AI MUST NEVER INVENT**: Campus prices, stall names, availability, or counter locations.
  *(Example: AI is strictly prohibited from asserting "MAIT Paneer Sandwich costs ₹30" unless ₹30 was retrieved from the Cloud Firestore `menuItems` document).*
- **FIRESTORE AUTHORITATIVE SOURCE**: In verified mode, all displayed prices, savings (₹), and dining hall stalls are drawn directly from audited ground-truth records.

---

## 2. End-to-End User Flow

The complete flow from food discovery to impact confirmation:

```
   1. Search / Scan Food
      ├── Text search by name (e.g., "Chole Bhature", "Paneer Sandwich")
      └── Upload/Capture plate photo via Gemini Vision
              │
              ▼
   2. AI Food Identification & Analysis
      ├── Multimodal dish identification
      ├── Confidence scoring (High / Medium / Low)
      └── 3-Dimensional Evaluation:
            • BODY (Health: 0-10)
            • WALLET (Affordability: 0-10)
            • PLANET (Sustainability: 0-10)
              │
              ▼
   3. Campus Access Gate Verification
      ├── If UNVERIFIED (General Mode):
      │     └── General nutrition benchmark alternative displayed (no campus stall or price)
      └── If VERIFIED (Campus Mode, e.g. MAIT):
            └── Query Firestore `menuItems` where `campusId == 'MAIT'` and `available == true`
              │
              ▼
   4. Campus-Aware Smart Swap Recommendation
      ├── Evaluates available campus items via transparent multi-criteria formula
      ├── Calculates exact pocket savings: (Initial Menu Price - Swap Menu Price)
      └── Formulates 3 actionable, plain-English reasons
              │
              ▼
   5. Accept Smart Swap
      └── Dispatches telemetry record to `impactService.logDecision`
```

---

## 3. Structured AI Response Schema

The centralized AI service ([`src/services/aiService.ts`](../src/services/aiService.ts)) enforces a strict TypeScript contract (`AIFoodAnalysisResult`):

```typescript
export interface AIFoodAnalysisResult {
  foodName: string;
  hindiName?: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0.0 to 1.0
  isUncertain: boolean;
  healthScore: number; // 0.0 - 10.0 (BODY)
  affordabilityScore: number; // 0.0 - 10.0 (WALLET)
  sustainabilityScore: number; // 0.0 - 10.0 (PLANET)
  nutrition: {
    calories: number; // kcal
    protein: number;  // grams
    carbs: number;    // grams
    fat: number;      // grams
  };
  explanation: {
    body: string;     // Concise nutritional rationale
    wallet: string;   // Student budget tier rationale
    planet: string;   // Ecological/carbon footprint rationale
  };
  cautions: string[]; // Preparation and dietary observations
  isEstimate: true;   // Disclaimer flag
  disclaimer: string;
  analyzedAt: string;
  sourceType: 'text_search' | 'image_upload' | 'demo_sample';
}
```

---

## 4. Confidence Handling & Uncertainty Safeguards

1. **High Confidence (`>= 0.80`)**:
   - The dish is definitively identified (e.g. standard Indian meal like Chole Bhature, Rajma Chawal, or Samosa).
   - Displayed with a green **"High Confidence AI Estimate"** badge.
2. **Medium Confidence (`0.60 - 0.79`)**:
   - Generic or regional variations (e.g. unbranded veg roll, mixed vegetable curry).
   - Displayed with a blue **"Moderate Confidence AI Estimate"** badge.
3. **Low Confidence / Uncertain (`< 0.60`)**:
   - Triggered by blurry photos, non-food images, or unidentifiable search strings.
   - Sets `isUncertain: true`.
   - **User UI Action**: Prominently renders an amber/rose alert:
     > **"Food identification is uncertain."**  
     > *EcoBite AI was unable to verify this food item with high confidence. The metrics below are preliminary general estimates.*
   - Provides a direct one-click button: **[ Search Food Manually ]**.

---

## 5. Smart Swap Recommendation Engine

The recommendation engine ([`src/services/swapService.ts`](../src/services/swapService.ts)) employs a bounded, transparent multi-criteria ranking algorithm.

### 5.1 Centralized Decision Weights
```typescript
export const SWAP_CONFIG = {
  weights: {
    healthImprovement: 0.40, // 40% priority: Higher protein, lower saturated fat
    priceSavings: 0.35,      // 35% priority: Pocket savings for student budget
    sustainability: 0.15,    // 15% priority: Lower carbon/water footprint
    availabilityBonus: 0.10, // 10% priority: Verified in-stock confirmation
  },
  minHealthImprovementThreshold: 0.5,
};
```

### 5.2 Composite Scoring Formula
For each candidate item $i$ retrieved from Firestore:

$$\text{Score}_i = w_{\text{health}} \cdot \Delta H_i + w_{\text{price}} \cdot \Delta P_i + w_{\text{sust}} \cdot \Delta S_i + w_{\text{avail}} \cdot A_i$$

Where:
- $\Delta H_i = \text{HealthScore}_i - \text{HealthScore}_{\text{original}}$
- $\Delta P_i = \text{Price}_{\text{original}} - \text{Price}_i$ (positive value indicates student savings in ₹)
- $\Delta S_i = \text{SustScore}_i - \text{SustScore}_{\text{original}}$
- $A_i = 1$ if item is verified in-stock, $0$ otherwise.

### 5.3 Deterministic No-Match Rule
If no item on campus achieves $\Delta H \ge 0.5$ or $\text{Savings} \ge ₹15$:
- The engine returns `hasSwap: false`.
- UI displays: **"No verified Smart Swap is available right now."**
- EcoBite **never** fabricates a fictional alternative to fill the slot.

---

## 6. Safety, Tone, & Ethical Guardrails

1. **Non-Diagnostic Health Guidance**:
   - EcoBite AI is strictly an educational nutrition tool for students.
   - It **never** diagnoses medical conditions (e.g. diabetes, hypertension, obesity).
   - It **never** tells a student they have a disease or offers clinical treatment advice.
2. **Estimation Terminology**:
   - All AI values are explicitly framed with disclaimers:
     - *"Estimated nutrition"*
     - *"AI-based estimate"*
     - *"Approximate values"*
3. **Client-Side Key Protection**:
   - The Gemini API key is loaded via secure Vite environment variables (`import.meta.env.VITE_GEMINI_API_KEY`).
   - If the key is absent or a network call times out (7–9 seconds), EcoBite automatically fails over to the **Deterministic Indian Food Knowledge Base** with zero crashes.
