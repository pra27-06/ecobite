/**
 * EcoBite AI - Food Intelligence Service Layer
 * 
 * Provides universal, publicly accessible food intelligence across India.
 * Does not require verified campus access.
 */

import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getMockFoodById, searchMockFoods } from '../data/mockFoods';
import type { FoodProfileDoc, ServiceResponse } from '../types';

function mapMockToProfileDoc(mock: ReturnType<typeof getMockFoodById>): FoodProfileDoc | null {
  if (!mock) return null;
  return {
    foodId: mock.id,
    name: mock.name,
    aliases: mock.hindiName ? [mock.hindiName] : [],
    nutrition: {
      calories: mock.nutrition.calories,
      protein: mock.nutrition.protein,
      carbs: mock.nutrition.carbs,
      fat: mock.nutrition.fat,
    },
    healthScore: mock.scores.body,
    sustainabilityScore: mock.scores.planet,
    affordabilityScore: mock.scores.wallet,
    description: mock.description,
    category: mock.category,
    updatedAt: new Date().toISOString(),
  };
}

export const foodService = {
  /**
   * Get a food profile by ID (e.g. 'chole-bhature', 'paneer-sandwich')
   */
  async getFoodProfileById(foodId: string): Promise<ServiceResponse<FoodProfileDoc>> {
    if (!db) {
      // Local fallback
      const mock = getMockFoodById(foodId);
      const mapped = mapMockToProfileDoc(mock);
      if (mapped) {
        return { success: true, data: mapped };
      }
      return { success: false, error: `Food profile '${foodId}' not found.` };
    }

    try {
      const foodRef = doc(db, 'foodProfiles', foodId);
      const foodSnap = await getDoc(foodRef);

      if (foodSnap.exists()) {
        return { success: true, data: foodSnap.data() as FoodProfileDoc };
      }

      // Fallback to local catalog if not yet seeded in Firestore
      const mock = getMockFoodById(foodId);
      const mapped = mapMockToProfileDoc(mock);
      if (mapped) {
        return { success: true, data: mapped };
      }

      return { success: false, error: `Food profile '${foodId}' not found.` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching food profile.';
      return { success: false, error: message };
    }
  },

  /**
   * Search food profiles by query and category filter
   */
  async searchFoodProfiles(queryStr: string, category?: string): Promise<ServiceResponse<FoodProfileDoc[]>> {
    if (!db) {
      let results = searchMockFoods(queryStr);
      if (category && category !== 'All') {
        results = results.filter((f) => f.category === category);
      }
      const mappedList = results
        .map((m) => mapMockToProfileDoc(m))
        .filter((p): p is FoodProfileDoc => p !== null);
      return { success: true, data: mappedList };
    }

    try {
      const foodsRef = collection(db, 'foodProfiles');
      const querySnap = await getDocs(foodsRef);

      if (!querySnap.empty) {
        const docs: FoodProfileDoc[] = [];
        querySnap.forEach((d) => docs.push(d.data() as FoodProfileDoc));

        let filtered = docs;
        if (queryStr.trim()) {
          const q = queryStr.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.aliases?.some((a) => a.toLowerCase().includes(q))
          );
        }
        if (category && category !== 'All') {
          filtered = filtered.filter((item) => item.category === category);
        }
        return { success: true, data: filtered };
      }

      // Fallback if collection is not yet populated
      let results = searchMockFoods(queryStr);
      if (category && category !== 'All') {
        results = results.filter((f) => f.category === category);
      }
      const mappedList = results
        .map((m) => mapMockToProfileDoc(m))
        .filter((p): p is FoodProfileDoc => p !== null);

      return { success: true, data: mappedList };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error querying food profiles.';
      return { success: false, error: message };
    }
  },

  /**
   * Get all universal food profiles
   */
  async getAllFoodProfiles(): Promise<ServiceResponse<FoodProfileDoc[]>> {
    return this.searchFoodProfiles('', 'All');
  },
};
