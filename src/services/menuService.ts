/**
 * EcoBite AI - Menu Service Layer
 * 
 * Enforces the core product architecture:
 * 1. Nationwide dynamic menu support:
 *    Any college manager can upload, review, and publish their own menu.
 * 2. Strict Draft vs Published boundary:
 *    Draft menu items are NEVER visible on the student portal. Only PUBLISHED items are returned.
 * 3. Seeded MAIT catalog retained as the default campus baseline.
 */

import { doc, getDocs, collection, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MAIT_MENU_ITEMS } from '../data/maitMenuData';
import type { 
  MenuItemDoc, 
  MenuUploadDoc, 
  ExtractedMenuItem, 
  ServiceResponse 
} from '../types';

const MENU_OVERRIDES_KEY = 'ecobite_menu_overrides_';
const MENU_UPLOADS_KEY = 'ecobite_menu_uploads_';
const PUBLISHED_DYNAMIC_KEY = 'ecobite_menu_published_';

// Retrieve local overrides for any campus
function getLocalOverrides(campusId: string): Record<string, Partial<MenuItemDoc>> {
  try {
    const raw = localStorage.getItem(`${MENU_OVERRIDES_KEY}${campusId.toUpperCase()}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverride(campusId: string, menuItemId: string, updates: Partial<MenuItemDoc>): void {
  try {
    const current = getLocalOverrides(campusId);
    current[menuItemId] = {
      ...(current[menuItemId] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${MENU_OVERRIDES_KEY}${campusId.toUpperCase()}`, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save menu override to local storage:', err);
  }
}

// Retrieve dynamically published items stored locally
function getLocalPublishedItems(campusId: string): MenuItemDoc[] {
  try {
    const raw = localStorage.getItem(`${PUBLISHED_DYNAMIC_KEY}${campusId.toUpperCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPublishedItems(campusId: string, items: MenuItemDoc[]): void {
  try {
    const existing = getLocalPublishedItems(campusId);
    const map = new Map<string, MenuItemDoc>();
    existing.forEach((i) => map.set(i.menuItemId, i));
    items.forEach((i) => map.set(i.menuItemId, i));
    localStorage.setItem(
      `${PUBLISHED_DYNAMIC_KEY}${campusId.toUpperCase()}`,
      JSON.stringify(Array.from(map.values()))
    );
  } catch (err) {
    console.warn('Failed to save published items to local storage:', err);
  }
}

function getEffectiveMaitCatalog(): MenuItemDoc[] {
  const overrides = getLocalOverrides('MAIT');
  const baseItems: MenuItemDoc[] = MAIT_MENU_ITEMS.map((item) => {
    if (overrides[item.menuItemId]) {
      return {
        ...item,
        ...overrides[item.menuItemId],
        status: (overrides[item.menuItemId]?.status || 'PUBLISHED') as 'DRAFT' | 'PUBLISHED',
      };
    }
    return {
      ...item,
      status: 'PUBLISHED' as const,
    };
  });

  // Include any newly created items from overrides that didn't exist in base
  Object.keys(overrides).forEach((id) => {
    const exists = baseItems.some((b) => b.menuItemId === id);
    if (!exists && overrides[id]?.name) {
      baseItems.push({
        status: 'PUBLISHED',
        ...overrides[id],
      } as MenuItemDoc);
    }
  });

  // Include dynamic published items
  const dynamicItems = getLocalPublishedItems('MAIT');
  dynamicItems.forEach((dyn) => {
    const idx = baseItems.findIndex((b) => b.menuItemId === dyn.menuItemId);
    if (idx >= 0) {
      baseItems[idx] = dyn;
    } else {
      baseItems.push(dyn);
    }
  });

  return baseItems;
}

export const menuService = {
  /**
   * Fetch all PUBLISHED menu items for any campus.
   * STRICT GUARANTEE: Never returns DRAFT items to students.
   */
  async getPublishedMenu(campusId: string): Promise<ServiceResponse<MenuItemDoc[]>> {
    const normId = (campusId || 'MAIT').toUpperCase();

    // 1. If offline or no Firestore, return local published store / baseline
    if (!db) {
      if (normId === 'MAIT') {
        const published = getEffectiveMaitCatalog().filter(
          (i) => i.available && i.verified && i.status !== 'DRAFT'
        );
        return { success: true, data: published };
      }
      const localDyn = getLocalPublishedItems(normId).filter(
        (i) => i.available && i.status === 'PUBLISHED'
      );
      return { success: true, data: localDyn };
    }

    try {
      const itemsRef = collection(db, 'menuItems');
      const q = query(
        itemsRef,
        where('campusId', 'in', [normId, normId.toLowerCase(), campusId]),
        where('available', '==', true)
      );
      const querySnap = await getDocs(q);

      const items: MenuItemDoc[] = [];
      querySnap.forEach((d) => {
        const item = d.data() as MenuItemDoc;
        // Strict guardrail: Filter out drafts
        if (item.status !== 'DRAFT') {
          items.push(item);
        }
      });

      // Merge with locally published items for offline continuity
      const localDyn = getLocalPublishedItems(normId).filter(
        (i) => i.available && i.status === 'PUBLISHED'
      );
      localDyn.forEach((ld) => {
        if (!items.some((it) => it.menuItemId === ld.menuItemId)) {
          items.push(ld);
        }
      });

      // Fallback to MAIT seed catalog if Firestore is empty for MAIT
      if (items.length === 0 && normId === 'MAIT') {
        const effective = getEffectiveMaitCatalog().filter(
          (item) => item.verified && item.available && item.status !== 'DRAFT'
        );
        return { success: true, data: effective };
      }

      return { success: true, data: items };
    } catch (err) {
      console.warn('[menuService] Error fetching published menu from Firestore, using local catalog:', err);
      if (normId === 'MAIT') {
        const effective = getEffectiveMaitCatalog().filter(
          (item) => item.verified && item.available && item.status !== 'DRAFT'
        );
        return { success: true, data: effective };
      }
      const localDyn = getLocalPublishedItems(normId).filter(
        (i) => i.available && i.status === 'PUBLISHED'
      );
      return { success: true, data: localDyn };
    }
  },

  /**
   * Fetch all available menu items for a campus.
   * REQUIRES verified campus access.
   */
  async getCampusMenu(
    campusId: string,
    isCampusVerified: boolean
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    if (!isCampusVerified) {
      return {
        success: false,
        error: 'Access Denied: Verified campus access is required to view authentic canteen menus and prices.',
      };
    }

    return this.getPublishedMenu(campusId);
  },

  /**
   * Fetch full menu catalog for campus managers/admins (includes out-of-stock and draft items)
   */
  async getManagerCampusMenu(
    campusId: string,
    canteenId?: string
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    const normId = (campusId || 'MAIT').toUpperCase();

    if (!db) {
      if (normId === 'MAIT') {
        let catalog = getEffectiveMaitCatalog();
        if (canteenId && canteenId !== 'all') {
          catalog = catalog.filter((i) => i.canteenId === canteenId);
        }
        return { success: true, data: catalog };
      }
      let items = getLocalPublishedItems(normId);
      if (canteenId && canteenId !== 'all') {
        items = items.filter((i) => i.canteenId === canteenId);
      }
      return { success: true, data: items };
    }

    try {
      const itemsRef = collection(db, 'menuItems');
      const q = query(
        itemsRef,
        where('campusId', 'in', [normId, normId.toLowerCase(), campusId])
      );
      const querySnap = await getDocs(q);

      const items: MenuItemDoc[] = [];
      querySnap.forEach((d) => items.push(d.data() as MenuItemDoc));

      if (items.length === 0 && normId === 'MAIT') {
        let catalog = getEffectiveMaitCatalog();
        if (canteenId && canteenId !== 'all') {
          catalog = catalog.filter((i) => i.canteenId === canteenId);
        }
        return { success: true, data: catalog };
      }

      const filtered = canteenId && canteenId !== 'all'
        ? items.filter((i) => i.canteenId === canteenId)
        : items;

      return { success: true, data: filtered };
    } catch {
      let catalog = normId === 'MAIT' ? getEffectiveMaitCatalog() : getLocalPublishedItems(normId);
      if (canteenId && canteenId !== 'all') {
        catalog = catalog.filter((i) => i.canteenId === canteenId);
      }
      return { success: true, data: catalog };
    }
  },

  /**
   * Backward-compatible alias for existing admin callers
   */
  async getAdminCampusMenu(
    campusId: string,
    _isCampusAdmin?: boolean
  ): Promise<ServiceResponse<MenuItemDoc[]>> {
    return this.getManagerCampusMenu(campusId);
  },

  /**
   * Save extracted menu items as DRAFT (NOT visible to students).
   */
  async saveMenuDraft(params: {
    campusId: string;
    canteenId: string;
    uploadedBy: string;
    items: ExtractedMenuItem[];
    originalFileName?: string;
    fileType?: string;
  }): Promise<ServiceResponse<{ uploadId: string; count: number }>> {
    const { campusId, canteenId, uploadedBy, items, originalFileName, fileType } = params;
    const normCampus = (campusId || 'MAIT').toUpperCase();
    const timestamp = new Date().toISOString();
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const uploadDoc: MenuUploadDoc = {
      uploadId,
      campusId: normCampus,
      canteenId: canteenId || 'main-canteen',
      uploadedBy: uploadedBy || 'manager',
      originalFileName: originalFileName || 'menu-upload.jpg',
      fileType: fileType || 'image/jpeg',
      status: 'DRAFT',
      extractedItemCount: items.length,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Prepare MenuItemDocs with status: 'DRAFT'
    const draftMenuItems: MenuItemDoc[] = items.map((item, idx) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const menuItemId = `${normCampus.toLowerCase()}-${canteenId}-${slug || idx}`;
      return {
        menuItemId,
        campusId: normCampus,
        canteenId: canteenId || 'main-canteen',
        name: item.name,
        category: item.category.toLowerCase(),
        foodCategory: item.category,
        price: item.price,
        available: item.available,
        description: item.description || '',
        verified: false,
        source: 'ai_extraction_draft',
        status: 'DRAFT',
        extractionConfidence: item.confidence,
        needsReview: item.needsReview,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    // Store in Firestore if online
    if (db) {
      try {
        const uploadRef = doc(db, 'menuUploads', uploadId);
        await setDoc(uploadRef, uploadDoc);

        for (const draftItem of draftMenuItems) {
          const itemRef = doc(db, 'menuItems', draftItem.menuItemId);
          await setDoc(itemRef, draftItem);
        }
      } catch (err) {
        console.warn('[menuService] Firestore draft save failed, storing locally:', err);
      }
    }

    // Always persist to local cache for offline/demo reliability
    try {
      const currentUploads: MenuUploadDoc[] = JSON.parse(
        localStorage.getItem(`${MENU_UPLOADS_KEY}${normCampus}`) || '[]'
      );
      currentUploads.unshift(uploadDoc);
      localStorage.setItem(`${MENU_UPLOADS_KEY}${normCampus}`, JSON.stringify(currentUploads));

      draftMenuItems.forEach((item) => {
        saveLocalOverride(normCampus, item.menuItemId, item);
      });
    } catch (e) {
      console.warn('Local storage draft save failed:', e);
    }

    return {
      success: true,
      data: { uploadId, count: draftMenuItems.length },
    };
  },

  /**
   * Confirm and PUBLISH extracted menu items.
   * This makes items instantly live and visible to students in the Student Portal!
   */
  async publishMenu(params: {
    campusId: string;
    canteenId: string;
    uploadedBy: string;
    items: ExtractedMenuItem[];
    uploadId?: string;
    originalFileName?: string;
    fileType?: string;
  }): Promise<ServiceResponse<{ publishedCount: number; campusId: string }>> {
    const { campusId, canteenId, uploadedBy, items, uploadId, originalFileName, fileType } = params;
    const normCampus = (campusId || 'MAIT').toUpperCase();
    const timestamp = new Date().toISOString();
    const effectiveUploadId = uploadId || `upload-${Date.now()}`;

    const uploadDoc: MenuUploadDoc = {
      uploadId: effectiveUploadId,
      campusId: normCampus,
      canteenId: canteenId || 'main-canteen',
      uploadedBy: uploadedBy || 'manager',
      originalFileName: originalFileName || 'verified-menu.jpg',
      fileType: fileType || 'image/jpeg',
      status: 'PUBLISHED',
      extractedItemCount: items.length,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Prepare MenuItemDocs with status: 'PUBLISHED' and verified: true
    const publishedItems: MenuItemDoc[] = items.map((item, idx) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const menuItemId = `${normCampus.toLowerCase()}-${canteenId}-${slug || idx}`;
      return {
        menuItemId,
        campusId: normCampus,
        canteenId: canteenId || 'main-canteen',
        name: item.name,
        category: item.category.toLowerCase(),
        foodCategory: item.category,
        price: item.price ?? 50, // default fallback if manager left blank
        available: item.available,
        description: item.description || '',
        verified: true,
        source: 'manager_published',
        status: 'PUBLISHED',
        extractionConfidence: item.confidence,
        needsReview: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    // Write to Cloud Firestore
    if (db) {
      try {
        const uploadRef = doc(db, 'menuUploads', effectiveUploadId);
        await setDoc(uploadRef, uploadDoc);

        for (const item of publishedItems) {
          const itemRef = doc(db, 'menuItems', item.menuItemId);
          await setDoc(itemRef, item);
        }
      } catch (err) {
        console.warn('[menuService] Firestore publish failed, saving locally:', err);
      }
    }

    // Persist locally for instant offline availability & test suites
    saveLocalPublishedItems(normCampus, publishedItems);
    publishedItems.forEach((item) => {
      saveLocalOverride(normCampus, item.menuItemId, item);
    });

    try {
      const currentUploads: MenuUploadDoc[] = JSON.parse(
        localStorage.getItem(`${MENU_UPLOADS_KEY}${normCampus}`) || '[]'
      );
      const existingIdx = currentUploads.findIndex((u) => u.uploadId === effectiveUploadId);
      if (existingIdx >= 0) {
        currentUploads[existingIdx] = uploadDoc;
      } else {
        currentUploads.unshift(uploadDoc);
      }
      localStorage.setItem(`${MENU_UPLOADS_KEY}${normCampus}`, JSON.stringify(currentUploads));
    } catch (e) {
      console.warn('Local storage upload list save failed:', e);
    }

    return {
      success: true,
      data: {
        publishedCount: publishedItems.length,
        campusId: normCampus,
      },
    };
  },

  /**
   * Update an existing menu item (e.g. price, availability, category)
   */
  async updateMenuItem(
    menuItemId: string,
    updates: Partial<MenuItemDoc>,
    campusId: string,
    isCampusManager: boolean
  ): Promise<ServiceResponse<MenuItemDoc>> {
    if (!isCampusManager) {
      return {
        success: false,
        error: 'Access Denied: Only authorized campus managers can modify menu items or prices.',
      };
    }

    const normCampus = (campusId || 'MAIT').toUpperCase();

    if (updates.price !== undefined && updates.price !== null && (typeof updates.price !== 'number' || updates.price < 0)) {
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

    saveLocalOverride(normCampus, menuItemId, cleanUpdates);

    if (db) {
      try {
        const itemRef = doc(db, 'menuItems', menuItemId);
        await updateDoc(itemRef, cleanUpdates);
      } catch (err) {
        console.warn('[EcoBite Manager] Firestore update failed, retained locally:', err);
      }
    }

    const updatedItem = getEffectiveMaitCatalog().find((item) => item.menuItemId === menuItemId);
    if (!updatedItem) {
      return {
        success: true,
        data: {
          menuItemId,
          campusId: normCampus,
          canteenId: 'main-canteen',
          name: updates.name || 'Menu Item',
          category: updates.category || 'meal',
          price: updates.price ?? 50,
          available: updates.available ?? true,
          description: updates.description || '',
          verified: true,
          source: 'manager_edit',
          updatedAt: timestamp,
        },
      };
    }

    return { success: true, data: updatedItem };
  },

  /**
   * Add a single new menu item manually
   */
  async addMenuItem(
    itemData: Omit<MenuItemDoc, 'menuItemId' | 'updatedAt'>,
    campusId: string,
    isCampusManager: boolean
  ): Promise<ServiceResponse<MenuItemDoc>> {
    if (!isCampusManager) {
      return {
        success: false,
        error: 'Access Denied: Only authorized managers can add menu items.',
      };
    }

    const normCampus = (campusId || 'MAIT').toUpperCase();

    if (itemData.price !== null && itemData.price !== undefined && itemData.price < 0) {
      return {
        success: false,
        error: 'Invalid price: Price must be a non-negative number.',
      };
    }

    const slug = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const menuItemId = `${normCampus.toLowerCase()}-${itemData.canteenId}-${slug}`;
    const timestamp = new Date().toISOString();

    const newItem: MenuItemDoc = {
      ...itemData,
      campusId: normCampus,
      menuItemId,
      verified: true,
      status: 'PUBLISHED',
      updatedAt: timestamp,
    };

    saveLocalOverride(normCampus, menuItemId, newItem);

    if (db) {
      try {
        const itemRef = doc(db, 'menuItems', menuItemId);
        await setDoc(itemRef, newItem);
      } catch (err) {
        console.warn('[EcoBite Manager] Firestore add failed, retained locally:', err);
      }
    }

    return {
      success: true,
      data: newItem,
    };
  },
};
