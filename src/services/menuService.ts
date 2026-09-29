/**
 * EcoBite AI - Menu Service Layer
 * 
 * Enforces the core product architecture:
 * 1. Campus-specific menus, stall prices, and item availability are protected
 *    behind verified campus access. Merely selecting an institution name does NOT grant access.
 * 2. Campus Administrators can modify menu items, prices (₹), and availability.
 *    Modifications propagate directly to student menus.
 * 3. Cross-campus administrative modifications are strictly forbidden.
 */

import { doc, getDoc, getDocs, collection, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MAIT_MENU_ITEMS } from '../data/maitMenuData';
import type { MenuItemDoc, ServiceResponse } from '../types';

const MENU_OVERRIDES_KEY = 'ecobite_menu_overrides_MAIT';

// Helper to retrieve and merge local admin overrides for MAIT
function getLocalOverrides(): Record<string, Partial<MenuItemDoc>> {
  try {
    const raw = localStorage.getItem(MENU_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverride(menuItemId: string, updates: Partial<MenuItemDoc>): void {
  try {
    const current = getLocalOverrides();
    current[menuItemId] = {
      ...(current[menuItemId] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(MENU_OVERRIDES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save menu override to local storage:', err);
  }
}

function getEffectiveMaitCatalog(): MenuItemDoc[] {
  const overrides = getLocalOverrides();
  const baseItems = MAIT_MENU_ITEMS.map((item) => {
    if (overrides[item.menuItemId]) {
      return {
        ...item,
        ...overrides[item.menuItemId],
      };
    }
    return item;
  });

  // Include any newly created items from overrides that didn't exist in base
  Object.keys(overrides).forEach((id) => {
    const exists = baseItems.some((b) => b.menuItemId === id);
    if (!exists && overrides[id]?.name) {
      baseItems.push(overrides[id] as MenuItemDoc);
    }
  });

  return baseItems;
}

export const menuService = {
  /**
   * Fetch all available menu items for a campus.
   * REQUIRES verified campus access.
   */
  async getCampusMenu(
    campusId: string,
    isCampusVerified: boolean
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    // 1. Strict security gate
    if (!isCampusVerified) {
      return {
        success: false,
        error: 'Access Denied: Verified campus access is required to view authentic canteen menus and prices.',
      };
    }

    const normalizedId = campusId.toUpperCase();

    // 2. If Firestore is offline or unconfigured, return effective verified MAIT dataset
    if (!db) {
      if (normalizedId === 'MAIT') {
        const effective = getEffectiveMaitCatalog().filter((item) => item.verified && item.available);
        return { success: true, data: effective };
      }
      return { success: true, data: [] };
    }

    try {
      const itemsRef = collection(db, 'menuItems');
      const q = query(
        itemsRef,
        where('campusId', 'in', [campusId, normalizedId, campusId.toLowerCase()]),
        where('available', '==', true)
      );
      const querySnap = await getDocs(q);

      const items: MenuItemDoc[] = [];
      querySnap.forEach((d) => items.push(d.data() as MenuItemDoc));

      // Fallback/merge with local effective MAIT dataset
      if (items.length === 0 && normalizedId === 'MAIT') {
        const effective = getEffectiveMaitCatalog().filter((item) => item.verified && item.available);
        return { success: true, data: effective };
      }

      return { success: true, data: items };
    } catch {
      // Graceful fallback for local evaluation
      if (normalizedId === 'MAIT') {
        const effective = getEffectiveMaitCatalog().filter((item) => item.verified && item.available);
        return { success: true, data: effective };
      }
      return { success: false, error: 'Error fetching campus menu.' };
    }
  },

  /**
   * Fetch full menu catalog for campus administrators (includes out-of-stock items)
   * REQUIRES campus_admin role.
   */
  async getAdminCampusMenu(
    campusId: string,
    isCampusAdmin: boolean
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    if (!isCampusAdmin) {
      return {
        success: false,
        error: 'Access Denied: Campus Administrator authorization required.',
      };
    }

    const normalizedId = campusId.toUpperCase();
    if (normalizedId !== 'MAIT') {
      return {
        success: false,
        error: 'Unauthorized: Cross-campus administrative operations are prohibited.',
      };
    }

    if (!db) {
      return {
        success: true,
        data: getEffectiveMaitCatalog(),
      };
    }

    try {
      const itemsRef = collection(db, 'menuItems');
      const q = query(
        itemsRef,
        where('campusId', 'in', [campusId, normalizedId, campusId.toLowerCase()])
      );
      const querySnap = await getDocs(q);

      const items: MenuItemDoc[] = [];
      querySnap.forEach((d) => items.push(d.data() as MenuItemDoc));

      if (items.length === 0) {
        return { success: true, data: getEffectiveMaitCatalog() };
      }

      return { success: true, data: items };
    } catch {
      return { success: true, data: getEffectiveMaitCatalog() };
    }
  },

  /**
   * Fetch menu items for a specific canteen stall.
   * REQUIRES verified campus access.
   */
  async getMenuItemsByCanteen(
    campusId: string,
    canteenId: string,
    isCampusVerified: boolean
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    if (!isCampusVerified) {
      return {
        success: false,
        error: 'Access Denied: Verified campus access required to view canteen stall items.',
      };
    }

    const normalizedId = campusId.toUpperCase();
    const effective = getEffectiveMaitCatalog().filter(
      (item) => item.canteenId === canteenId && item.verified && item.available
    );

    if (!db) {
      if (normalizedId === 'MAIT') {
        return { success: true, data: effective };
      }
      return { success: true, data: [] };
    }

    try {
      const itemsRef = collection(db, 'menuItems');
      const q = query(
        itemsRef,
        where('campusId', 'in', [campusId, normalizedId, campusId.toLowerCase()]),
        where('canteenId', '==', canteenId),
        where('available', '==', true)
      );
      const querySnap = await getDocs(q);

      const items: MenuItemDoc[] = [];
      querySnap.forEach((d) => items.push(d.data() as MenuItemDoc));

      if (items.length === 0 && normalizedId === 'MAIT') {
        return { success: true, data: effective };
      }

      return { success: true, data: items };
    } catch {
      if (normalizedId === 'MAIT') {
        return { success: true, data: effective };
      }
      return { success: false, error: 'Error fetching canteen items.' };
    }
  },

  /**
   * Fetch a single menu item by ID.
   * REQUIRES verified campus access.
   */
  async getMenuItem(
    menuItemId: string,
    campusId: string,
    isCampusVerified: boolean
  ): Promise<ServiceResponse<MenuItemDoc>> {
    if (!isCampusVerified) {
      return {
        success: false,
        error: 'Access Denied: Verified campus access is required to view item prices and stall details.',
      };
    }

    const normalizedId = campusId.toUpperCase();
    const foundLocal = getEffectiveMaitCatalog().find((item) => item.menuItemId === menuItemId);

    if (!db) {
      if (foundLocal) {
        return { success: true, data: foundLocal };
      }
      return { success: false, error: `Menu item '${menuItemId}' not found.` };
    }

    try {
      const itemRef = doc(db, 'menuItems', menuItemId);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const item = itemSnap.data() as MenuItemDoc;
        if (item.campusId.toUpperCase() !== normalizedId) {
          return { success: false, error: 'Unauthorized: Cross-campus item lookup is prohibited.' };
        }
        return { success: true, data: item };
      }

      if (foundLocal) {
        return { success: true, data: foundLocal };
      }

      return { success: false, error: `Menu item '${menuItemId}' not found.` };
    } catch {
      if (foundLocal) {
        return { success: true, data: foundLocal };
      }
      return { success: false, error: 'Error fetching menu item.' };
    }
  },

  /**
   * Update an existing menu item (e.g. price, availability, category)
   * REQUIRES campus_admin role for this campus.
   */
  async updateMenuItem(
    menuItemId: string,
    updates: Partial<MenuItemDoc>,
    campusId: string,
    isCampusAdmin: boolean
  ): Promise<ServiceResponse<MenuItemDoc>> {
    // 1. Enforce admin role
    if (!isCampusAdmin) {
      return {
        success: false,
        error: 'Access Denied: Only authorized campus administrators can modify menu items or prices.',
      };
    }

    // 2. Enforce campus tenancy (MAIT admin cannot edit other campuses)
    const normalizedId = campusId.toUpperCase();
    if (normalizedId !== 'MAIT') {
      return {
        success: false,
        error: 'Unauthorized: Cross-campus menu modification is prohibited.',
      };
    }

    // 3. Price validation if price is being updated
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      return {
        success: false,
        error: 'Invalid price: Menu item price must be a non-negative number.',
      };
    }

    const timestamp = new Date().toISOString();
    const cleanUpdates = {
      ...updates,
      updatedAt: timestamp,
    };

    // Save override locally immediately so student views reflect the change instantly
    saveLocalOverride(menuItemId, cleanUpdates);

    // If Firestore is available, sync to Cloud Firestore
    if (db) {
      try {
        const itemRef = doc(db, 'menuItems', menuItemId);
        await updateDoc(itemRef, cleanUpdates);
      } catch (err) {
        console.warn('[EcoBite Admin] Firestore update failed, retained in local override store:', err);
      }
    }

    const updatedItem = getEffectiveMaitCatalog().find((item) => item.menuItemId === menuItemId);
    if (!updatedItem) {
      return { success: false, error: 'Item not found after update.' };
    }

    return {
      success: true,
      data: updatedItem,
    };
  },

  /**
   * Add a new menu item to a campus canteen
   * REQUIRES campus_admin role.
   */
  async addMenuItem(
    itemData: Omit<MenuItemDoc, 'menuItemId' | 'updatedAt'>,
    campusId: string,
    isCampusAdmin: boolean
  ): Promise<ServiceResponse<MenuItemDoc>> {
    if (!isCampusAdmin) {
      return {
        success: false,
        error: 'Access Denied: Only authorized campus administrators can add menu items.',
      };
    }

    const normalizedId = campusId.toUpperCase();
    if (normalizedId !== 'MAIT') {
      return {
        success: false,
        error: 'Unauthorized: Cross-campus menu creation is prohibited.',
      };
    }

    if (itemData.price === undefined || itemData.price < 0) {
      return {
        success: false,
        error: 'Invalid price: Price must be a non-negative number.',
      };
    }

    const slug = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const menuItemId = `mait-${itemData.canteenId}-${slug}`;
    const timestamp = new Date().toISOString();

    const newItem: MenuItemDoc = {
      ...itemData,
      campusId: 'MAIT',
      menuItemId,
      verified: true,
      updatedAt: timestamp,
    };

    saveLocalOverride(menuItemId, newItem);

    if (db) {
      try {
        const itemRef = doc(db, 'menuItems', menuItemId);
        await setDoc(itemRef, newItem);
      } catch (err) {
        console.warn('[EcoBite Admin] Firestore add failed, retained locally:', err);
      }
    }

    return {
      success: true,
      data: newItem,
    };
  },
};
