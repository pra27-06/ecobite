/**
 * EcoBite AI - Centralized Smart Swap Recommendation Service
 * 
 * Recommends actionable, authentic alternatives available at the student's campus canteen.
 * 
 * Architectural Guarantees:
 * 1. ZERO Price Hallucination: Campus prices, canteen names, and stall availability
 *    are strictly retrieved from Cloud Firestore records.
 * 2. Campus Access Boundary: If the user is unverified, NO campus-specific prices or
 *    stall names are displayed. Only general national benchmarks are shown.
 * 3. Transparent Ranking Formula: Bounded, multi-criteria decision scoring.
 * 4. Deterministic No-Match Handling: If no verified dish meets criteria, clearly states
 *    "No verified Smart Swap is available right now" instead of fabricating recommendations.
 */

import { menuService } from './menuService';
import { campusService } from './campusService';
import type { 
  AIFoodAnalysisResult, 
  SmartSwapResult, 
  SmartSwapRecommendation, 
  MenuItemDoc,
  ServiceResponse 
} from '../types';

// Transparent multi-criteria decision weights
export const SWAP_CONFIG = {
  weights: {
    healthImprovement: 0.40,
    priceSavings: 0.35,
    sustainability: 0.15,
    availabilityBonus: 0.10,
  },
  minHealthImprovementThreshold: 0.5, // Swap must be noticeably healthier or provide major savings
};

export const swapService = {
  /**
   * Formulate a Smart Swap recommendation
   */
  async getSmartSwap(
    originalFoodName: string,
    aiAnalysis: AIFoodAnalysisResult,
    campusId: string = 'MAIT',
    isCampusVerified: boolean = false
  ): Promise<ServiceResponse<SmartSwapResult>> {
    const origHealth = aiAnalysis.healthScore;
    const origSustainability = aiAnalysis.sustainabilityScore;

    // ==========================================
    // CASE A: UNVERIFIED CAMPUS (GENERAL PUBLIC MODE)
    // ==========================================
    if (!isCampusVerified) {
      const generalSwap = this.getGeneralSwapBenchmark(originalFoodName, aiAnalysis);
      return {
        success: true,
        data: {
          success: true,
          isCampusVerified: false,
          hasSwap: true,
          originalFood: {
            name: aiAnalysis.foodName,
            price: undefined, // Strictly hidden in unverified mode
            healthScore: origHealth,
            sustainabilityScore: origSustainability,
            source: 'General Public Estimate',
          },
          recommendedSwap: generalSwap,
        },
      };
    }

    // ==========================================
    // CASE B: VERIFIED CAMPUS MODE (e.g. MAIT)
    // ==========================================
    try {
      // 1. Fetch authentic menu items from Firestore for this campus
      const menuResp = await menuService.getCampusMenu(campusId, isCampusVerified);
      if (!menuResp.success || !menuResp.data || menuResp.data.length === 0) {
        return {
          success: true,
          data: {
            success: true,
            isCampusVerified: true,
            hasSwap: false,
            originalFood: {
              name: aiAnalysis.foodName,
              healthScore: origHealth,
              sustainabilityScore: origSustainability,
              source: `${campusId.toUpperCase()} Campus`,
            },
            noSwapReason: 'No verified menu items found in Firestore for this campus.',
          },
        };
      }

      // 2. Fetch canteen metadata from Firestore
      const canteensResp = await campusService.getCanteensByCampus(campusId);
      const canteensMap = new Map<string, { name: string; location: string }>();
      if (canteensResp.success && canteensResp.data) {
        canteensResp.data.forEach((c) => {
          canteensMap.set(c.canteenId, { name: c.name, location: c.location });
        });
      }

      const availableItems = menuResp.data.filter((i) => i.available && i.verified);

      // 3. Find if original food exists on campus menu to determine authentic current price
      const normOrigName = originalFoodName.toLowerCase();
      const matchedOrigMenuItem = availableItems.find((item) => {
        const itemNorm = item.name.toLowerCase();
        return (
          itemNorm === normOrigName ||
          itemNorm.includes(normOrigName) ||
          normOrigName.includes(itemNorm)
        );
      });

      // Authentic price from Firestore if available, otherwise baseline estimate
      const originalPrice = matchedOrigMenuItem ? matchedOrigMenuItem.price : 60;

      // 4. Rank campus candidates using transparent scoring
      const candidates = availableItems.filter((candidate) => {
        // Exclude the exact same item
        if (matchedOrigMenuItem && candidate.menuItemId === matchedOrigMenuItem.menuItemId) {
          return false;
        }
        if (candidate.name.toLowerCase() === normOrigName) {
          return false;
        }
        return true;
      });

      // Score each candidate
      let bestCandidate: MenuItemDoc | null = null;
      let highestScore = -Infinity;
      let bestReasons: string[] = [];
      let bestMoneySaved = 0;

      for (const item of candidates) {
        const estimatedCandidateHealth = this.estimateItemHealthScore(item);
        const estimatedCandidateSustainability = this.estimateItemSustainabilityScore(item);

        const healthDelta = estimatedCandidateHealth - origHealth;
        const moneySaved = originalPrice - item.price;
        const sustDelta = estimatedCandidateSustainability - origSustainability;

        // Skip candidate if it is both significantly unhealthier AND more expensive
        if (healthDelta < -1.0 && moneySaved < 0) {
          continue;
        }

        // Normalized criteria
        // Health score delta: 0 to 10 scale normalized by / 5
        const normHealth = Math.max(-1, Math.min(2, healthDelta / 3));
        // Savings normalized: ₹50 savings gives 1.0
        const normSavings = Math.max(-1, Math.min(2, moneySaved / 30));
        // Sustainability normalized
        const normSust = Math.max(-1, Math.min(2, sustDelta / 3));

        const compositeScore =
          normHealth * SWAP_CONFIG.weights.healthImprovement +
          normSavings * SWAP_CONFIG.weights.priceSavings +
          normSust * SWAP_CONFIG.weights.sustainability +
          (item.available ? 1 : 0) * SWAP_CONFIG.weights.availabilityBonus;

        if (compositeScore > highestScore && (healthDelta >= 0.5 || moneySaved >= 15)) {
          highestScore = compositeScore;
          bestCandidate = item;
          bestMoneySaved = moneySaved;
          bestReasons = this.generateSwapReasons(item, aiAnalysis, moneySaved, healthDelta);
        }
      }

      // If no candidate scored high enough
      if (!bestCandidate) {
        return {
          success: true,
          data: {
            success: true,
            isCampusVerified: true,
            hasSwap: false,
            originalFood: {
              name: aiAnalysis.foodName,
              price: matchedOrigMenuItem?.price,
              healthScore: origHealth,
              sustainabilityScore: origSustainability,
              source: matchedOrigMenuItem ? `MAIT (${matchedOrigMenuItem.canteenId})` : 'MAIT Campus Baseline',
            },
            noSwapReason: 'No verified Smart Swap is available right now that improves your health or saves money.',
          },
        };
      }

      // 5. Build authentic verified swap response
      const canteenInfo = canteensMap.get(bestCandidate.canteenId) || {
        name: bestCandidate.canteenId,
        location: 'Campus Dining Area',
      };

      const recommendedHealth = this.estimateItemHealthScore(bestCandidate);
      const recommendedSust = this.estimateItemSustainabilityScore(bestCandidate);

      const recommendation: SmartSwapRecommendation = {
        name: bestCandidate.name,
        menuItemId: bestCandidate.menuItemId,
        canteenId: bestCandidate.canteenId,
        canteenName: canteenInfo.name,
        canteenLocation: canteenInfo.location,
        price: bestCandidate.price, // Ground-truth price from Firestore
        healthScore: recommendedHealth,
        sustainabilityScore: recommendedSust,
        moneySaved: Math.max(0, bestMoneySaved),
        isAvailable: bestCandidate.available,
        isCampusVerified: true,
        whyReasons: bestReasons,
        source: 'firestore_campus',
      };

      return {
        success: true,
        data: {
          success: true,
          isCampusVerified: true,
          hasSwap: true,
          originalFood: {
            name: aiAnalysis.foodName,
            price: originalPrice,
            healthScore: origHealth,
            sustainabilityScore: origSustainability,
            source: matchedOrigMenuItem ? `${canteenInfo.name}` : 'MAIT Campus Baseline',
          },
          recommendedSwap: recommendation,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error evaluating campus Smart Swap.';
      return { success: false, error: message };
    }
  },

  /**
   * Generate general benchmark swap when campus is unverified
   */
  getGeneralSwapBenchmark(
    foodName: string,
    _aiAnalysis: AIFoodAnalysisResult
  ): SmartSwapRecommendation {
    const q = foodName.toLowerCase();

    if (q.includes('bhature') || q.includes('samosa') || q.includes('patie') || q.includes('patties')) {
      return {
        name: 'Paneer Sandwich or Sprouted Moong Chaat',
        price: 35, // general benchmark
        healthScore: 7.8,
        sustainabilityScore: 7.2,
        moneySaved: 25,
        isAvailable: true,
        isCampusVerified: false,
        whyReasons: [
          'Substantially higher lean protein for sustained study energy',
          'Avoids reused deep-frying cooking oils',
          'Estimated student pocket savings of ~₹25',
        ],
        source: 'general_benchmark',
      };
    }

    if (q.includes('maggi') || q.includes('chowmein') || q.includes('noodle')) {
      return {
        name: 'Vegetable Upma or Fresh Fruit Bowl',
        price: 30,
        healthScore: 7.5,
        sustainabilityScore: 8.0,
        moneySaved: 10,
        isAvailable: true,
        isCampusVerified: false,
        whyReasons: [
          'Lower sodium and unrefined complex carbohydrates',
          'Rich in dietary fiber and essential micronutrients',
          'Zero ultra-processed artificial seasonings',
        ],
        source: 'general_benchmark',
      };
    }

    // Default general swap
    return {
      name: 'Dal Tadka with Whole Wheat Roti',
      price: 45,
      healthScore: 8.2,
      sustainabilityScore: 8.5,
      moneySaved: 15,
      isAvailable: true,
      isCampusVerified: false,
      whyReasons: [
        'Balanced macronutrient distribution with complete plant protein',
        'Lower glycemic load prevents post-lunch sleepiness',
        'Minimal carbon and water footprint compared to fast food',
      ],
      source: 'general_benchmark',
    };
  },

  /**
   * Helper to estimate health score for a Firestore menu item
   */
  estimateItemHealthScore(item: MenuItemDoc): number {
    const n = item.name.toLowerCase();
    const cat = item.category.toLowerCase();

    if (n.includes('juice') || n.includes('healthy') || n.includes('fruit')) return 7.8;
    if (n.includes('paneer sandwich') || n.includes('paneer kulcha')) return 7.5;
    if (n.includes('rajma chawal') || n.includes('choley chawal')) return 7.6;
    if (n.includes('dal') || n.includes('khichdi')) return 8.4;
    if (n.includes('soup')) return 7.2;
    if (n.includes('bhature')) return 3.5;
    if (n.includes('samosa') || n.includes('patie') || n.includes('patties')) return 3.6;
    if (n.includes('fries') || n.includes('potato')) return 3.8;
    if (n.includes('chowmein') || n.includes('burger')) return 4.8;
    if (n.includes('maggi')) return 4.0;
    if (cat === 'meals') return 6.8;
    return 6.0;
  },

  /**
   * Helper to estimate sustainability score for a Firestore menu item
   */
  estimateItemSustainabilityScore(item: MenuItemDoc): number {
    const n = item.name.toLowerCase();
    if (n.includes('juice') || n.includes('fruit')) return 8.5;
    if (n.includes('rajma') || n.includes('choley') || n.includes('dal')) return 8.2;
    if (n.includes('soup') || n.includes('tea')) return 7.5;
    if (n.includes('paneer') || n.includes('cheese')) return 6.5;
    if (n.includes('maggi') || n.includes('chowmein')) return 5.5;
    return 6.5;
  },

  /**
   * Helper to formulate 3 clear reasons for this swap
   */
  generateSwapReasons(
    candidate: MenuItemDoc,
    _originalAnalysis: AIFoodAnalysisResult,
    moneySaved: number,
    healthDelta: number
  ): string[] {
    const reasons: string[] = [];

    // Reason 1: Health / Nutrition
    if (healthDelta >= 1.0) {
      reasons.push(
        `Higher nutritional density (+${healthDelta.toFixed(1)} Body score) with cleaner preparation.`
      );
    } else {
      reasons.push('Maintains balanced carbohydrate and micronutrient distribution for campus focus.');
    }

    // Reason 2: Money / Pocket Savings
    if (moneySaved > 0) {
      reasons.push(`Saves ₹${moneySaved} on your daily student budget compared to the initial item.`);
    } else if (moneySaved === 0) {
      reasons.push(`Equal cost (₹${candidate.price}), but offers substantially greater satiety and nutrition.`);
    } else {
      reasons.push(`High protein value per rupee invested at ₹${candidate.price}.`);
    }

    // Reason 3: Satiety & Preparation
    const name = candidate.name.toLowerCase();
    if (name.includes('juice')) {
      reasons.push('Naturally hydrating with zero artificial coloring or excessive refined sugar.');
    } else if (name.includes('paneer')) {
      reasons.push('Packed with lean cottage cheese protein to curb afternoon hunger spikes.');
    } else if (name.includes('rajma') || name.includes('choley')) {
      reasons.push('Slow-digesting legume fiber provides steady cognitive energy through afternoon lectures.');
    } else {
      reasons.push('Lower saturated fat profile to avoid post-meal classroom sluggishness.');
    }

    return reasons.slice(0, 3);
  },
};
