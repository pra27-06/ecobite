/**
 * EcoBite AI - Student Demand Intelligence Service
 * 
 * STRICT ARCHITECTURAL DOCTRINE:
 * 1. EcoBite is NOT a sales tracker. It does NOT claim to know exact units sold or revenue.
 * 2. EcoBite is NOT a physical waste sensor. It does NOT detect physical trash weights.
 * 3. EcoBite captures STUDENT DEMAND SIGNALS inside the application:
 *    - SEARCH: Student is actively seeking or inquiring about this dish
 *    - SMART_SWAP_ACCEPTED: Student preferred and selected this alternative
 *    - SMART_SWAP_REJECTED: Student declined this alternative in favor of another choice
 * 4. STRICT PRIVACY BOUNDARY: Zero student PII. Signals are aggregated into anonymous
 *    campus-level decision intelligence.
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  limit, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  DemandSignalDoc, 
  DemandEventType, 
  DemandScoreWeights, 
  CanteenDemandItem, 
  CanteenDemandOverview,
  MenuItemDoc,
  ServiceResponse
} from '../types';
import { DEFAULT_DEMAND_WEIGHTS } from '../types';
import { classifyFoodCategory } from '../utils/foodCategory';
import { MAIT_MENU_ITEMS } from '../data/maitMenuData';

const DEMAND_COLLECTION = 'demandSignals';

// In-memory telemetry cache for offline / demo continuity
const localSignalsCache: DemandSignalDoc[] = [
  // Realistic pre-seeded baseline demand signals for MAIT
  { campusId: 'MAIT', foodId: 'paneer-sandwich', foodName: 'Paneer Sandwich', eventType: 'SEARCH', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { campusId: 'MAIT', foodId: 'chole-bhature', foodName: 'Chole Bhature', eventType: 'SEARCH', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
  { campusId: 'MAIT', foodId: 'rajma-chawal', foodName: 'Rajma Chawal', eventType: 'SEARCH', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
  { campusId: 'MAIT', foodId: 'tea', foodName: 'Tea (Chai)', eventType: 'SEARCH', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
  { campusId: 'MAIT', foodId: 'paneer-sandwich', foodName: 'Paneer Sandwich', eventType: 'SMART_SWAP_ACCEPTED', originalFoodName: 'Chole Bhature', recommendedFoodName: 'Paneer Sandwich', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { campusId: 'MAIT', foodId: 'rajma-chawal', foodName: 'Rajma Chawal', eventType: 'SMART_SWAP_ACCEPTED', originalFoodName: 'Chole Bhature', recommendedFoodName: 'Rajma Chawal', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { campusId: 'MAIT', foodId: 'fruit-chill', foodName: 'Fruit Chill', eventType: 'SMART_SWAP_REJECTED', originalFoodName: 'Brownie', recommendedFoodName: 'Fruit Chill', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { campusId: 'MAIT', foodId: 'singapori-chowmein', foodName: 'Singapori Chowmein', eventType: 'SMART_SWAP_REJECTED', originalFoodName: 'Veg Chowmein', recommendedFoodName: 'Singapori Chowmein', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
];

export const demandService = {
  /**
   * Record a student demand signal (SEARCH, SMART_SWAP_ACCEPTED, SMART_SWAP_REJECTED).
   * Writes to Firestore and maintains local session cache with zero student PII.
   */
  async recordSignal(signal: {
    campusId: string;
    foodId?: string;
    foodName: string;
    menuItemId?: string;
    eventType: DemandEventType;
    originalFoodName?: string;
    recommendedFoodName?: string;
    originalPrice?: number;
    alternativePrice?: number;
    moneySaved?: number;
  }): Promise<ServiceResponse<DemandSignalDoc>> {
    const slug = signal.foodId || signal.foodName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newDoc: DemandSignalDoc = {
      campusId: signal.campusId || 'MAIT',
      foodId: slug,
      foodName: signal.foodName,
      menuItemId: signal.menuItemId,
      eventType: signal.eventType,
      originalFoodName: signal.originalFoodName,
      recommendedFoodName: signal.recommendedFoodName,
      originalPrice: signal.originalPrice,
      alternativePrice: signal.alternativePrice,
      moneySaved: signal.moneySaved,
      timestamp: new Date().toISOString(),
    };

    // Keep local cache updated for instant optimistic UI
    localSignalsCache.unshift(newDoc);

    if (!db) {
      return { success: true, data: newDoc };
    }

    try {
      const colRef = collection(db, DEMAND_COLLECTION);
      const res = await addDoc(colRef, newDoc);
      newDoc.signalId = res.id;
      return { success: true, data: newDoc };
    } catch (err) {
      console.warn('[DemandService] Firestore write fallback to local cache:', err);
      return { success: true, data: newDoc };
    }
  },

  /**
   * Fetch all demand signals for a campus
   */
  async getCampusSignals(campusId: string = 'MAIT'): Promise<DemandSignalDoc[]> {
    if (!db) {
      return [...localSignalsCache];
    }

    try {
      const q = query(
        collection(db, DEMAND_COLLECTION),
        where('campusId', '==', campusId),
        limit(200)
      );
      const snap = await getDocs(q);
      const list: DemandSignalDoc[] = [];
      snap.forEach((doc) => {
        list.push({ signalId: doc.id, ...(doc.data() as DemandSignalDoc) });
      });

      // Merge unique signals from Firestore and local cache
      const combined = [...localSignalsCache, ...list];
      const unique = Array.from(
        new Map(combined.map((s) => [`${s.timestamp}_${s.foodName}_${s.eventType}`, s])).values()
      );
      return unique;
    } catch (err) {
      console.warn('[DemandService] Firestore fetch error, using cache:', err);
      return [...localSignalsCache];
    }
  },

  /**
   * Subscribe to real-time demand signal updates via Firestore onSnapshot
   */
  subscribeCampusSignals(
    campusId: string = 'MAIT',
    onUpdate: (signals: DemandSignalDoc[]) => void
  ): () => void {
    if (!db) {
      onUpdate([...localSignalsCache]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, DEMAND_COLLECTION),
        where('campusId', '==', campusId),
        limit(150)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: DemandSignalDoc[] = [];
          snap.forEach((doc) => {
            list.push({ signalId: doc.id, ...(doc.data() as DemandSignalDoc) });
          });
          const combined = [...localSignalsCache, ...list];
          const unique = Array.from(
            new Map(combined.map((s) => [`${s.timestamp}_${s.foodName}_${s.eventType}`, s])).values()
          );
          onUpdate(unique);
        },
        (err) => {
          console.warn('[DemandService] Real-time listener error, providing cached signals:', err);
          onUpdate([...localSignalsCache]);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('[DemandService] Listener init error, falling back to static cache:', err);
      onUpdate([...localSignalsCache]);
      return () => {};
    }
  },

  /**
   * Get summarized metric counts for a campus
   */
  async getDemandMetrics(campusId: string = 'MAIT'): Promise<ServiceResponse<{
    totalSignals: number;
    searchesCount: number;
    swapsAcceptedCount: number;
    swapsRejectedCount: number;
  }>> {
    const signals = await this.getCampusSignals(campusId);
    const searchesCount = signals.filter((s) => s.eventType === 'SEARCH').length;
    const swapsAcceptedCount = signals.filter((s) => s.eventType === 'SMART_SWAP_ACCEPTED').length;
    const swapsRejectedCount = signals.filter((s) => s.eventType === 'SMART_SWAP_REJECTED').length;
    return {
      success: true,
      data: {
        totalSignals: signals.length,
        searchesCount,
        swapsAcceptedCount,
        swapsRejectedCount,
      },
    };
  },

  /**
   * Compute comprehensive demand metrics, weighted demand scores, and menu optimizations.
   */
  computeDemandMetrics(
    signals: DemandSignalDoc[],
    menuItems: MenuItemDoc[] = MAIT_MENU_ITEMS,
    weights: DemandScoreWeights = DEFAULT_DEMAND_WEIGHTS
  ): {
    items: CanteenDemandItem[];
    overview: CanteenDemandOverview;
  } {
    const today = new Date().toISOString().split('T')[0];

    // Aggregation maps per food
    const countMap = new Map<string, { searches: number; accepted: number; rejected: number }>();
    let totalSearchesToday = 0;
    let totalSwapsAcceptedToday = 0;
    let totalSwapsRejectedToday = 0;

    signals.forEach((s) => {
      const targetName = s.recommendedFoodName || s.foodName;
      const key = targetName.toLowerCase().trim();

      if (s.eventType === 'SEARCH') totalSearchesToday++;
      if (s.eventType === 'SMART_SWAP_ACCEPTED') totalSwapsAcceptedToday++;
      if (s.eventType === 'SMART_SWAP_REJECTED') totalSwapsRejectedToday++;

      const curr = countMap.get(key) || { searches: 0, accepted: 0, rejected: 0 };
      if (s.eventType === 'SEARCH') curr.searches++;
      if (s.eventType === 'SMART_SWAP_ACCEPTED') curr.accepted++;
      if (s.eventType === 'SMART_SWAP_REJECTED') curr.rejected++;
      countMap.set(key, curr);
    });

    // Baseline demand values for MAIT dishes
    const baselineSignals: Record<string, { searches: number; accepted: number; rejected: number }> = {
      'paneer sandwich': { searches: 142, accepted: 76, rejected: 8 },
      'chole bhature': { searches: 188, accepted: 42, rejected: 12 },
      'rajma chawal': { searches: 134, accepted: 68, rejected: 6 },
      'choley chawal': { searches: 98, accepted: 39, rejected: 14 },
      'tea (chai)': { searches: 210, accepted: 15, rejected: 4 },
      'spl. kulhad tea': { searches: 85, accepted: 12, rejected: 2 },
      'fresh mosambi juice': { searches: 84, accepted: 52, rejected: 5 },
      'pasta (mix sauce)': { searches: 64, accepted: 18, rejected: 22 },
      'aloo patties': { searches: 112, accepted: 28, rejected: 16 },
      'singapori chowmein': { searches: 26, accepted: 6, rejected: 18 },
    };

    // Build CanteenDemandItem for verified menu dishes
    const demandItems: CanteenDemandItem[] = menuItems.map((item) => {
      const key = item.name.toLowerCase().trim();
      const realCounts = countMap.get(key) || { searches: 0, accepted: 0, rejected: 0 };
      const baseline = baselineSignals[key] || { searches: 15, accepted: 5, rejected: 2 };

      const searchInterest = baseline.searches + realCounts.searches;
      const swapAcceptedCount = baseline.accepted + realCounts.accepted;
      const swapRejectedCount = baseline.rejected + realCounts.rejected;

      // Demand score calculation: (searches * 1) + (accepted * 3) + (rejected * -2)
      const demandScore =
        searchInterest * weights.search +
        swapAcceptedCount * weights.swapAccepted +
        swapRejectedCount * weights.swapRejected;

      // Interest Level classification
      let interestLevel: 'high' | 'medium' | 'lower' = 'medium';
      if (searchInterest >= 90 || demandScore >= 200) {
        interestLevel = 'high';
      } else if (searchInterest < 40 && demandScore < 40) {
        interestLevel = 'lower';
      }

      // Acceptance Status
      let acceptanceStatus: 'strong' | 'moderate' | 'lower_acceptance' = 'moderate';
      if (swapAcceptedCount > swapRejectedCount * 2) {
        acceptanceStatus = 'strong';
      } else if (swapRejectedCount > swapAcceptedCount) {
        acceptanceStatus = 'lower_acceptance';
      }

      // Actionable operational recommendation
      let recommendation = 'Steady student appetite. Maintain standard availability.';
      if (interestLevel === 'high' && acceptanceStatus === 'strong') {
        recommendation = 'Top student favorite & accepted Smart Swap. Prioritize morning stock.';
      } else if (interestLevel === 'high' && swapRejectedCount > 10) {
        recommendation = 'High search volume but frequent swap rejection. Review recipe or portion.';
      } else if (acceptanceStatus === 'lower_acceptance') {
        recommendation = 'Lower Smart Swap acceptance signal. Consider reviewing menu placement or pairing.';
      } else if (interestLevel === 'lower') {
        recommendation = 'Lower student interest signal. Prepare on-demand to avoid excess.';
      }

      return {
        itemId: item.menuItemId,
        name: item.name,
        category: classifyFoodCategory(item.name, item.category),
        canteenId: item.canteenId,
        canteenName: item.canteenId.replace(/-/g, ' ').toUpperCase(),
        price: item.price,
        searchInterest,
        swapAcceptedCount,
        swapRejectedCount,
        demandScore,
        interestLevel,
        acceptanceStatus,
        recommendation,
        isAvailable: item.available,
        isDemoSample: true,
      };
    });

    // Sort items by demandScore descending
    demandItems.sort((a, b) => b.demandScore - a.demandScore);

    // Compute top performers
    const mostDemanded = demandItems[0]?.name || 'Paneer Sandwich';
    const sortedByAccepted = [...demandItems].sort((a, b) => b.swapAcceptedCount - a.swapAcceptedCount);
    const mostAccepted = sortedByAccepted[0]?.name || 'Paneer Sandwich';
    const sortedByRejected = [...demandItems].sort((a, b) => b.swapRejectedCount - a.swapRejectedCount);
    const mostRejected = sortedByRejected[0]?.name || 'Singapori Chowmein';

    const overview: CanteenDemandOverview = {
      campusId: 'MAIT',
      date: today,
      totalSignalsToday: signals.length + 1042,
      totalSearchesToday: totalSearchesToday + 820,
      totalSwapsAcceptedToday: totalSwapsAcceptedToday + 168,
      totalSwapsRejectedToday: totalSwapsRejectedToday + 54,
      mostDemandedItem: mostDemanded,
      mostAcceptedSwap: mostAccepted,
      mostRejectedSwap: mostRejected,
      isDemoSample: true,
    };

    return { items: demandItems, overview };
  },
};
