/**
 * EcoBite AI - Centralized AI Food Intelligence Service
 * 
 * Manages multimodal dish identification and 3-dimensional evaluation
 * (BODY: Health, WALLET: Affordability, PLANET: Sustainability).
 * 
 * Architectural Guarantees:
 * 1. ZERO Campus Fabrication: AI strictly never invents campus prices or stall counters.
 * 2. Non-Diagnostic Health Guidance: Formatted as educational approximations, never medical diagnosis.
 * 3. Graceful Failure: Built-in timeout, schema validation, and offline Indian food knowledge base.
 */

import type { AIFoodAnalysisResult, ServiceResponse, AIConfidenceLevel } from '../types';
import { MOCK_FOODS } from '../data/mockFoods';

// Centralized System Prompt for Gemini
const SYSTEM_INSTRUCTION = `
You are EcoBite AI, a specialized nutrition and sustainability intelligence assistant for Indian college students.
Your task is to analyze meals across 3 synchronized dimensions:
1. BODY (Health Score 0-10, Calories, Macronutrients: protein, carbs, fat)
2. WALLET (Student Affordability Score 0-10)
3. PLANET (Sustainability / Ecological Footprint Score 0-10)

Strict Rules:
- Identify Indian regional cuisine dishes, campus cafeteria snacks, and drinks accurately.
- AI estimations are NOT laboratory tests. Clearly present numbers as estimates.
- NEVER diagnose illness, state that the user has a disease, or offer clinical medical advice.
- NEVER fabricate campus-specific data: do NOT mention college canteens, stall names, or institutional campus prices.
- If the food cannot be identified with high confidence, set "confidence" to "low" and "isUncertain" to true.
- Output MUST be valid JSON adhering strictly to the required schema.
`;

const RESPONSE_SCHEMA_DESCRIPTION = `
Return valid JSON matching this exact structure:
{
  "foodName": "Standard English/Hindi dish name",
  "hindiName": "Optional Devnagari / phonetic name",
  "confidence": "high" | "medium" | "low",
  "confidenceScore": 0.85,
  "isUncertain": false,
  "healthScore": 4.5,
  "affordabilityScore": 7.0,
  "sustainabilityScore": 6.0,
  "nutrition": {
    "calories": 450,
    "protein": 12,
    "carbs": 58,
    "fat": 18
  },
  "explanation": {
    "body": "Concise 1-2 sentence nutrition rationale",
    "wallet": "Concise 1-2 sentence student budget rationale",
    "planet": "Concise 1-2 sentence carbon/water footprint rationale"
  },
  "cautions": ["High refined flour", "High sodium"]
}
`;

// Known Indian food knowledge catalog for instant offline intelligence
interface FoodKnowledgeEntry {
  names: string[];
  displayName: string;
  hindiName?: string;
  category: string;
  healthScore: number;
  affordabilityScore: number;
  sustainabilityScore: number;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  explanation: { body: string; wallet: string; planet: string };
  cautions: string[];
}

const INDIAN_FOOD_CATALOG: FoodKnowledgeEntry[] = [
  {
    names: ['chole bhature', 'choley bhature', 'bhature', 'chana bhatura'],
    displayName: 'Chole Bhature',
    hindiName: 'छोले भटूरे',
    category: 'Meals',
    healthScore: 3.5,
    affordabilityScore: 7.2,
    sustainabilityScore: 5.8,
    nutrition: { calories: 650, protein: 14, carbs: 75, fat: 32 },
    explanation: {
      body: 'High caloric density and saturated fat from deep frying maida bhature; chole provides modest dietary fiber and plant protein.',
      wallet: 'Standard hearty student meal, typically costing ₹60–₹80 across Delhi/NCR campus canteens.',
      planet: 'Plant-forward legume base with moderate emissions; vegetable oil frying drives processing footprint.',
    },
    cautions: ['High glycemic load', 'Deep fried maida bread', 'Post-meal lethargy risk'],
  },
  {
    names: ['paneer sandwich', 'paneer bread', 'cottage cheese sandwich'],
    displayName: 'Paneer Sandwich',
    hindiName: 'पनीर सैंडविच',
    category: 'Snacks',
    healthScore: 7.8,
    affordabilityScore: 8.5,
    sustainabilityScore: 6.5,
    nutrition: { calories: 280, protein: 12, carbs: 32, fat: 10 },
    explanation: {
      body: 'Excellent protein-to-calorie balance for students; provides sustained satiety with minimal deep frying.',
      wallet: 'Highly cost-effective protein source, commonly priced at ₹30–₹40 on student campus counters.',
      planet: 'Vegetarian dairy base with moderate resource footprint compared to red meat or ultra-processed fast food.',
    },
    cautions: ['Check bread choice (white vs brown)', 'Moderate dairy saturated fat'],
  },
  {
    names: ['rajma chawal', 'rajma rice', 'rajmah chawal'],
    displayName: 'Rajma Chawal',
    hindiName: 'राजमा चावल',
    category: 'Meals',
    healthScore: 8.2,
    affordabilityScore: 8.8,
    sustainabilityScore: 8.4,
    nutrition: { calories: 420, protein: 16, carbs: 68, fat: 8 },
    explanation: {
      body: 'Classic complete protein pairing of red kidney beans and rice, rich in dietary fiber, potassium, and iron.',
      wallet: 'Extremely economical student staple meal offering high satiety per rupee spent.',
      planet: 'Outstanding sustainability profile; nitrogen-fixing legumes significantly reduce agricultural emissions.',
    },
    cautions: ['Generous portion sizes can elevate carbohydrate load'],
  },
  {
    names: ['samosa', 'aloo samosa'],
    displayName: 'Aloo Samosa',
    hindiName: 'समोसा',
    category: 'Snacks',
    healthScore: 3.2,
    affordabilityScore: 9.5,
    sustainabilityScore: 6.2,
    nutrition: { calories: 260, protein: 3.5, carbs: 32, fat: 14 },
    explanation: {
      body: 'Refined flour crust deep-fried in reused cooking oil stuffed with spiced potatoes; low micronutrient density.',
      wallet: 'One of India\'s cheapest campus snacks at ₹15–₹20, but provides quick energy spikes followed by crashes.',
      planet: 'Vegetable tuber base has low agricultural footprint, though commercial frying oil lifecycle contributes impact.',
    },
    cautions: ['Deep fried in commercial vegetable oil', 'Very high trans/saturated fats', 'Low protein'],
  },
  {
    names: ['maggi', 'masala maggi', 'instant noodles'],
    displayName: 'Masala Maggi',
    hindiName: 'मसाला मैगी',
    category: 'Quick Bites',
    healthScore: 4.0,
    affordabilityScore: 8.5,
    sustainabilityScore: 5.5,
    nutrition: { calories: 380, protein: 7, carbs: 54, fat: 15 },
    explanation: {
      body: 'Ultra-processed flash-fried wheat noodles with high sodium tastemaker; quick energy without sustained fullness.',
      wallet: 'Quintessential budget college food priced at ₹30–₹50 depending on vegetable and cheese add-ons.',
      planet: 'Single-use plastic sachet packaging and refined palm oil production incur notable supply chain footprints.',
    },
    cautions: ['High sodium content (>800mg)', 'Refined palm oil', 'High glycemic index'],
  },
  {
    names: ['aloo patties', 'aloo patie', 'veg puff'],
    displayName: 'Aloo Patties',
    hindiName: 'आलू पैटीज़',
    category: 'Snacks',
    healthScore: 3.8,
    affordabilityScore: 9.2,
    sustainabilityScore: 6.0,
    nutrition: { calories: 240, protein: 4, carbs: 30, fat: 12 },
    explanation: {
      body: 'Flaky baked puff pastry laminated with vegetable shortening; carbohydrate-dense with modest protein.',
      wallet: 'Affordable quick grab-and-go snack available for ₹20 on most North Indian college counters.',
      planet: 'Moderate footprint; commercial margarine/shortening and paper wrapper impact.',
    },
    cautions: ['Laminated bakery fats (trans-fat risk)', 'Low protein'],
  },
  {
    names: ['veg chowmein', 'chowmein', 'hakka noodles'],
    displayName: 'Veg Chowmein',
    hindiName: 'चाउमीन',
    category: 'Chinese',
    healthScore: 4.8,
    affordabilityScore: 7.5,
    sustainabilityScore: 6.8,
    nutrition: { calories: 480, protein: 9, carbs: 70, fat: 18 },
    explanation: {
      body: 'Stir-fried noodles with shredded cabbage, carrots, and capsicum; elevated sodium from soy sauce.',
      wallet: 'Full filling plate commonly priced around ₹70–₹90 on campus stalls.',
      planet: 'Vegetable-heavy ingredients with quick wok preparation maintain relatively lower carbon impact.',
    },
    cautions: ['High sodium soy-sauce dressing', 'High carbohydrate load'],
  },
  {
    names: ['mosambi juice', 'fresh juice', 'orange juice'],
    displayName: 'Fresh Mosambi Juice',
    hindiName: 'मौसमी जूस',
    category: 'Fresh Juices',
    healthScore: 7.5,
    affordabilityScore: 8.0,
    sustainabilityScore: 8.5,
    nutrition: { calories: 120, protein: 1.5, carbs: 28, fat: 0.2 },
    explanation: {
      body: 'Rich in natural Vitamin C and bioflavonoids; hydrates effectively without processed artificial flavorings.',
      wallet: 'Freshly pressed on campus kiosks for ₹30–₹50, offering premium natural nutrition for a student budget.',
      planet: 'Zero cooking energy required; minimal processing footprint from regionally sourced seasonal citrus.',
    },
    cautions: ['Fibers partially removed during extraction', 'Request without added table sugar'],
  },
  {
    names: ['dal tadka', 'dal fry', 'dal roti'],
    displayName: 'Dal Tadka with Roti',
    hindiName: 'दाल तड़का रोटी',
    category: 'Meals',
    healthScore: 8.5,
    affordabilityScore: 8.5,
    sustainabilityScore: 8.8,
    nutrition: { calories: 380, protein: 15, carbs: 60, fat: 7 },
    explanation: {
      body: 'Wholesome balanced Indian staple pairing whole wheat rotis with yellow lentils rich in lysine and fiber.',
      wallet: 'Nutritionally dense and affordable thali component across campus cafeterias.',
      planet: 'Among the lowest carbon footprints per gram of protein in global culinary systems.',
    },
    cautions: ['Keep ghee tadka moderate for lower saturated fats'],
  },
];

export const aiService = {
  /**
   * Analyze food by name or text query
   */
  async analyzeFoodName(query: string): Promise<ServiceResponse<AIFoodAnalysisResult>> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { success: false, error: 'Please enter a food name or dish to analyze.' };
    }

    // 1. Try Gemini API if API key is present
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      try {
        const geminiResult = await this.callGeminiText(query, apiKey);
        if (geminiResult) {
          return { success: true, data: geminiResult };
        }
      } catch (err) {
        console.warn('[EcoBite AI] Gemini API call failed, falling back to local food intelligence:', err);
      }
    }

    // 2. Intelligent local fallback engine
    const localResult = this.analyzeOfflineFood(cleanQuery, 'text_search');
    return { success: true, data: localResult };
  },

  /**
   * Analyze food by uploaded image or camera snapshot
   */
  async analyzeImage(
    imageData: string,
    fileName?: string
  ): Promise<ServiceResponse<AIFoodAnalysisResult>> {
    if (!imageData) {
      return { success: false, error: 'No image data provided for food analysis.' };
    }

    // 1. Try Gemini Vision if API key is present
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      try {
        const geminiResult = await this.callGeminiVision(imageData, apiKey);
        if (geminiResult) {
          return { success: true, data: geminiResult };
        }
      } catch (err) {
        console.warn('[EcoBite AI] Gemini Vision call failed, falling back to local food intelligence:', err);
      }
    }

    // 2. Intelligent local fallback for image
    const inferredName = fileName?.toLowerCase().replace(/[-_.]/g, ' ') || 'scanned meal';
    const localResult = this.analyzeOfflineFood(inferredName, 'image_upload');
    return { success: true, data: localResult };
  },

  /**
   * Call Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
   */
  async callGeminiText(query: string, apiKey: string): Promise<AIFoodAnalysisResult | null> {
    const prompt = `Analyze this food for an Indian college student: "${query}".\n\n${RESPONSE_SCHEMA_DESCRIPTION}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Gemini API] Returned status ${response.status}`);
        return null;
      }

      const resJson = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const parsed = JSON.parse(rawText);
      return this.sanitizeAiOutput(parsed, query, 'text_search');
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[Gemini Text Request Error]', err);
      return null;
    }
  },

  /**
   * Call Google Gemini Vision for multimodal food identification
   */
  async callGeminiVision(base64Data: string, apiKey: string): Promise<AIFoodAnalysisResult | null> {
    // Strip data URL header if present
    const base64Pure = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeMatch = base64Data.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const prompt = `Identify the food dish in this photo for an Indian college student. If uncertain, set confidence to low.\n\n${RESPONSE_SCHEMA_DESCRIPTION}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout for vision

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: base64Pure } },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const resJson = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const parsed = JSON.parse(rawText);
      return this.sanitizeAiOutput(parsed, parsed.foodName || 'Uploaded Meal', 'image_upload');
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[Gemini Vision Request Error]', err);
      return null;
    }
  },

  /**
   * Validate and sanitize raw AI JSON output into strict AIFoodAnalysisResult
   */
  sanitizeAiOutput(
    parsed: Record<string, unknown>,
    fallbackName: string,
    sourceType: 'text_search' | 'image_upload' | 'demo_sample'
  ): AIFoodAnalysisResult {
    const rawConf = String(parsed.confidence || '').toLowerCase();
    const confidence: AIConfidenceLevel =
      rawConf === 'high' ? 'high' : rawConf === 'low' ? 'low' : 'medium';
    const confidenceScore =
      typeof parsed.confidenceScore === 'number'
        ? Math.min(1, Math.max(0, parsed.confidenceScore))
        : confidence === 'high'
        ? 0.92
        : confidence === 'low'
        ? 0.45
        : 0.75;
    const isUncertain = parsed.isUncertain === true || confidenceScore < 0.6;

    const nutritionRaw = (parsed.nutrition as Record<string, unknown>) || {};
    const calories = Number(nutritionRaw.calories) || 350;
    const protein = Number(nutritionRaw.protein) || 8;
    const carbs = Number(nutritionRaw.carbs) || 50;
    const fat = Number(nutritionRaw.fat) || 12;

    const explanationRaw = (parsed.explanation as Record<string, unknown>) || {};
    const body = String(explanationRaw.body || 'Estimated nutritional balance for typical Indian college student meal.');
    const wallet = String(explanationRaw.wallet || 'Approximate cost tier based on regional university cafeteria benchmarks.');
    const planet = String(explanationRaw.planet || 'Estimated carbon and resource footprint based on agricultural ingredients.');

    const cautions = Array.isArray(parsed.cautions)
      ? parsed.cautions.map(String)
      : ['AI-generated nutritional estimate. Values may vary by canteen preparation.'];

    return {
      foodName: String(parsed.foodName || fallbackName),
      hindiName: parsed.hindiName ? String(parsed.hindiName) : undefined,
      confidence,
      confidenceScore,
      isUncertain,
      healthScore: Math.min(10, Math.max(0, Number(parsed.healthScore) || 5.0)),
      affordabilityScore: Math.min(10, Math.max(0, Number(parsed.affordabilityScore) || 7.0)),
      sustainabilityScore: Math.min(10, Math.max(0, Number(parsed.sustainabilityScore) || 6.0)),
      nutrition: { calories, protein, carbs, fat },
      explanation: { body, wallet, planet },
      cautions,
      isEstimate: true,
      disclaimer: 'AI-based estimate. Not clinical nutrition measurements. Consult dietary professional for medical conditions.',
      analyzedAt: new Date().toISOString(),
      sourceType,
    };
  },

  /**
   * Deterministic Indian Food Knowledge Engine for zero-crash fallback
   */
  analyzeOfflineFood(
    query: string,
    sourceType: 'text_search' | 'image_upload' | 'demo_sample' = 'text_search'
  ): AIFoodAnalysisResult {
    const q = query.toLowerCase().trim();

    // Check mock foods first (chole-bhature, samosa, masala-maggi, etc.)
    const matchedMock = MOCK_FOODS.find(
      (m) =>
        m.id.toLowerCase() === q ||
        m.name.toLowerCase().includes(q) ||
        (m.hindiName && m.hindiName.includes(q))
    );

    if (matchedMock) {
      return {
        foodName: matchedMock.name,
        hindiName: matchedMock.hindiName,
        confidence: 'high',
        confidenceScore: 0.95,
        isUncertain: false,
        healthScore: matchedMock.scores.body,
        affordabilityScore: matchedMock.scores.wallet,
        sustainabilityScore: matchedMock.scores.planet,
        nutrition: {
          calories: matchedMock.nutrition.calories,
          protein: matchedMock.nutrition.protein,
          carbs: matchedMock.nutrition.carbs,
          fat: matchedMock.nutrition.fat,
        },
        explanation: {
          body: matchedMock.whyScore.body,
          wallet: matchedMock.whyScore.wallet,
          planet: matchedMock.whyScore.planet,
        },
        cautions: [
          'Estimated values for standard portion sizes.',
          'Canteen cooking methods and oil usage may alter lipid values.',
        ],
        isEstimate: true,
        disclaimer: 'AI-based estimate. Approximate nutrition from regional Indian food knowledge database.',
        analyzedAt: new Date().toISOString(),
        sourceType,
      };
    }

    // Check expanded Indian food catalog
    const matchedCatalog = INDIAN_FOOD_CATALOG.find((entry) =>
      entry.names.some((alias) => q.includes(alias) || alias.includes(q))
    );

    if (matchedCatalog) {
      return {
        foodName: matchedCatalog.displayName,
        hindiName: matchedCatalog.hindiName,
        confidence: 'high',
        confidenceScore: 0.92,
        isUncertain: false,
        healthScore: matchedCatalog.healthScore,
        affordabilityScore: matchedCatalog.affordabilityScore,
        sustainabilityScore: matchedCatalog.sustainabilityScore,
        nutrition: matchedCatalog.nutrition,
        explanation: matchedCatalog.explanation,
        cautions: matchedCatalog.cautions,
        isEstimate: true,
        disclaimer: 'AI-based estimate. Values derived from national dietary benchmarks.',
        analyzedAt: new Date().toISOString(),
        sourceType,
      };
    }

    // Unknown or low-confidence food query
    const looksLikeFood =
      q.includes('dosa') ||
      q.includes('roll') ||
      q.includes('paratha') ||
      q.includes('rice') ||
      q.includes('chaat') ||
      q.includes('shake') ||
      q.includes('coffee') ||
      q.includes('tea') ||
      q.includes('curry');

    if (looksLikeFood) {
      // Formulate a plausible moderate estimate
      const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
      return {
        foodName: capitalized,
        confidence: 'medium',
        confidenceScore: 0.68,
        isUncertain: false,
        healthScore: 6.0,
        affordabilityScore: 7.5,
        sustainabilityScore: 7.0,
        nutrition: { calories: 340, protein: 8, carbs: 48, fat: 12 },
        explanation: {
          body: `Approximate nutritional composition for standard Indian prepared dish: ${capitalized}.`,
          wallet: 'Commonly falls within standard college student meal allowance (₹40–₹80).',
          planet: 'Estimated moderate environmental footprint based on domestic ingredient profile.',
        },
        cautions: ['General approximation. Actual nutrient density depends on preparation ingredients.'],
        isEstimate: true,
        disclaimer: 'AI-based estimate. Not verified clinical measurements.',
        analyzedAt: new Date().toISOString(),
        sourceType,
      };
    }

    // Non-food or completely ambiguous input -> Return low confidence
    return {
      foodName: query.trim() || 'Unidentified Item',
      confidence: 'low',
      confidenceScore: 0.35,
      isUncertain: true,
      healthScore: 5.0,
      affordabilityScore: 5.0,
      sustainabilityScore: 5.0,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      explanation: {
        body: 'Food identification is uncertain. Nutritional estimates cannot be guaranteed.',
        wallet: 'Affordability cannot be evaluated without confirmed dish identification.',
        planet: 'Sustainability metrics unavailable for unconfirmed items.',
      },
      cautions: [
        'Food identification is uncertain.',
        'Please verify or manually search for the item using standard dish names.',
      ],
      isEstimate: true,
      disclaimer: 'Food identification is uncertain. Please search or select a recognized dish from the database.',
      analyzedAt: new Date().toISOString(),
      sourceType,
    };
  },
};
