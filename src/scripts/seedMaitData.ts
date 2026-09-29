/**
 * EcoBite AI — Safe Firestore Seeding Utility for MAIT Campus
 * 
 * Uses deterministic document IDs to prevent duplicates:
 * - campuses/MAIT
 * - canteens/{canteenId}
 * - menuItems/{menuItemId}
 * 
 * Safe Execution:
 * - Only seeds records where campusId === 'MAIT'.
 * - Never modifies or overwrites other campus documents.
 * - Sourced strictly from verified MAIT menu boards.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../firebase/config';
import { MAIT_CAMPUS_DOC, MAIT_CANTEENS_DOCS, MAIT_MENU_ITEMS } from '../data/maitMenuData';

export interface SeedResult {
  success: boolean;
  campusCreated: number;
  canteensCreated: number;
  menuItemsCreated: number;
  errors: string[];
  message: string;
}

export async function seedMaitCampusToFirestore(): Promise<SeedResult> {
  const result: SeedResult = {
    success: false,
    campusCreated: 0,
    canteensCreated: 0,
    menuItemsCreated: 0,
    errors: [],
    message: '',
  };

  if (!isFirebaseConfigured) {
    result.message = 'Firebase environment variables (VITE_FIREBASE_*) not configured. Cannot seed to remote Firestore.';
    result.errors.push('Firebase unconfigured in environment.');
    return result;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Seed MAIT Campus Document
    const campusRef = doc(db, 'campuses', MAIT_CAMPUS_DOC.campusId);
    await setDoc(campusRef, {
      ...MAIT_CAMPUS_DOC,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    result.campusCreated = 1;

    // 2. Seed MAIT Canteen Documents (4 canteens)
    for (const canteen of MAIT_CANTEENS_DOCS) {
      const canteenRef = doc(db, 'canteens', canteen.canteenId);
      await setDoc(canteenRef, {
        ...canteen,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      result.canteensCreated++;
    }

    // 3. Seed Verified Menu Items
    for (const item of MAIT_MENU_ITEMS) {
      if (item.campusId !== 'MAIT') {
        result.errors.push(`Skipped non-MAIT item: ${item.name}`);
        continue;
      }
      const itemRef = doc(db, 'menuItems', item.menuItemId);
      await setDoc(itemRef, {
        ...item,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      result.menuItemsCreated++;
    }

    result.success = true;
    result.message = `Successfully seeded MAIT campus: 1 campus, ${result.canteensCreated} canteens, and ${result.menuItemsCreated} verified menu items into Cloud Firestore.`;
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Firestore seeding error';
    result.errors.push(msg);
    result.message = `Seeding failed: ${msg}`;
    return result;
  }
}
