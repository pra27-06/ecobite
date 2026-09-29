/**
 * EcoBite AI - Campus Service Layer
 * 
 * Manages institutional campus documents, associated canteens, and verified access records.
 * Supports multi-campus scalability without frontend code modifications.
 */

import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MAIT_CAMPUS_DOC, MAIT_CANTEENS_DOCS } from '../data/maitMenuData';
import type { CampusDoc, CanteenDoc, CampusAccessDoc, ServiceResponse } from '../types';

export const campusService = {
  /**
   * Get metadata for a specific campus by ID
   */
  async getCampusById(campusId: string): Promise<ServiceResponse<CampusDoc>> {
    const normalizedId = campusId.toUpperCase();

    if (!db) {
      if (normalizedId === 'MAIT') {
        return { success: true, data: MAIT_CAMPUS_DOC };
      }
      return { success: false, error: `Campus '${campusId}' not found in offline catalog.` };
    }

    try {
      const campusRef = doc(db, 'campuses', normalizedId);
      const campusSnap = await getDoc(campusRef);

      if (campusSnap.exists()) {
        return { success: true, data: campusSnap.data() as CampusDoc };
      }

      // Check case-insensitive fallback if stored with lowercase
      const altRef = doc(db, 'campuses', campusId.toLowerCase());
      const altSnap = await getDoc(altRef);
      if (altSnap.exists()) {
        return { success: true, data: altSnap.data() as CampusDoc };
      }

      if (normalizedId === 'MAIT') {
        return { success: true, data: MAIT_CAMPUS_DOC };
      }

      return { success: false, error: `Campus '${campusId}' not found in Firestore.` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching campus.';
      return { success: false, error: message };
    }
  },

  /**
   * Get all active verified campuses
   */
  async getCampuses(): Promise<ServiceResponse<CampusDoc[]>> {
    if (!db) {
      return { success: true, data: [MAIT_CAMPUS_DOC] };
    }

    try {
      const campusesRef = collection(db, 'campuses');
      const q = query(campusesRef, where('verified', '==', true));
      const querySnap = await getDocs(q);

      const campuses: CampusDoc[] = [];
      querySnap.forEach((d) => campuses.push(d.data() as CampusDoc));

      if (campuses.length === 0) {
        return { success: true, data: [MAIT_CAMPUS_DOC] };
      }

      return { success: true, data: campuses };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching campuses.';
      return { success: false, error: message };
    }
  },

  /**
   * Get all canteens belonging to a specific campus
   */
  async getCanteensByCampus(campusId: string): Promise<ServiceResponse<CanteenDoc[]>> {
    const normalizedId = campusId.toUpperCase();

    if (!db) {
      if (normalizedId === 'MAIT') {
        return { success: true, data: MAIT_CANTEENS_DOCS };
      }
      return { success: true, data: [] };
    }

    try {
      const canteensRef = collection(db, 'canteens');
      const q = query(
        canteensRef,
        where('campusId', 'in', [campusId, normalizedId, campusId.toLowerCase()]),
        where('active', '==', true)
      );
      const querySnap = await getDocs(q);

      const canteens: CanteenDoc[] = [];
      querySnap.forEach((d) => canteens.push(d.data() as CanteenDoc));

      if (canteens.length === 0 && normalizedId === 'MAIT') {
        return { success: true, data: MAIT_CANTEENS_DOCS };
      }

      return { success: true, data: canteens };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching canteens.';
      return { success: false, error: message };
    }
  },

  /**
   * Get specific canteen details
   */
  async getCanteenById(canteenId: string): Promise<ServiceResponse<CanteenDoc>> {
    if (!db) {
      const found = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === canteenId);
      if (found) {
        return { success: true, data: found };
      }
      return { success: false, error: `Canteen '${canteenId}' not found.` };
    }

    try {
      const canteenRef = doc(db, 'canteens', canteenId);
      const canteenSnap = await getDoc(canteenRef);

      if (canteenSnap.exists()) {
        return { success: true, data: canteenSnap.data() as CanteenDoc };
      }

      const found = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === canteenId);
      if (found) {
        return { success: true, data: found };
      }

      return { success: false, error: `Canteen '${canteenId}' not found.` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching canteen.';
      return { success: false, error: message };
    }
  },

  /**
   * Check if a student has an active verified campusAccess record in Firestore
   */
  async getUserCampusAccess(userId: string, campusId: string): Promise<ServiceResponse<CampusAccessDoc | null>> {
    if (!db) {
      return { success: true, data: null };
    }

    try {
      const accessRef = collection(db, 'campusAccess');
      const q = query(
        accessRef,
        where('userId', '==', userId),
        where('campusId', 'in', [campusId, campusId.toUpperCase(), campusId.toLowerCase()]),
        where('status', '==', 'active')
      );
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0].data() as CampusAccessDoc;
        return { success: true, data: firstDoc };
      }

      return { success: true, data: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching campus access status.';
      return { success: false, error: message };
    }
  },
};
