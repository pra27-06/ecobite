/**
 * EcoBite AI - Student Order Intent & Canteen Preparation Queue Service
 * 
 * STRICT ARCHITECTURAL PRINCIPLES:
 * 1. EcoBite is NOT a food-delivery or checkout application.
 * 2. NO payment gateways, NO credit card forms, and NO transaction fees.
 * 3. NO sales tracking: Order requests are operational preparation signals to reduce counter crowding,
 *    never categorized as "revenue" or "units sold".
 * 4. STRICT PRIVACY BOUNDARY: Canteen staff see only privacy-safe Order IDs (#EC-1024), item name,
 *    quantity, and timestamps. Zero student passwords, profile info, or personal identifiers.
 * 5. GROUND TRUTH VALIDATION: Prices and item availability are verified against Firestore / catalog records.
 *    Client-submitted prices are ignored.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  OrderRequestDoc, 
  OrderRequestStatus, 
  OrderItem, 
  ServiceResponse 
} from '../types';
import { menuService } from './menuService';
import { MAIT_CANTEENS_DOCS } from '../data/maitMenuData';

const ORDERS_COLLECTION = 'orderRequests';
const LOCAL_STORAGE_ORDERS_KEY = 'ecobite_order_requests';
const LOCAL_STORAGE_ORDER_COUNTER_KEY = 'ecobite_order_counter';
const STUDENT_ANON_SESSION_KEY = 'ecobite_student_session_token';

// Cross-tab broadcast channel for instant multi-window synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('ecobite_orders_channel');
  }
} catch {
  // Graceful fallback for non-supporting environments
}

// In-memory cache for ultra-fast response and offline demo continuity
let inMemoryOrders: OrderRequestDoc[] = [
  // Initial baseline sample order for MAIT to show a live queue state on first load
  {
    orderId: 'EC-1023',
    orderNumber: 1023,
    studentId: 'anon-student-seed-1',
    campusId: 'MAIT',
    canteenId: 'amul-shop',
    canteenName: 'Amul Shop',
    items: [
      {
        menuItemId: 'mait-amul-02',
        name: 'Veg Cheese Grilled Sandwich',
        quantity: 1,
        price: 70,
        canteenId: 'amul-shop',
        category: 'sandwiches',
      }
    ],
    totalAmount: 70,
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  }
];

// Load persisted local orders on module load
function loadPersistedOrders(): OrderRequestDoc[] {
  if (typeof window === 'undefined') return inMemoryOrders;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const parsed: OrderRequestDoc[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with seed order
        const map = new Map<string, OrderRequestDoc>();
        inMemoryOrders.forEach((o) => map.set(o.orderId, o));
        parsed.forEach((o) => map.set(o.orderId, o));
        inMemoryOrders = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }
  } catch (err) {
    console.warn('[OrderService] Could not read local orders:', err);
  }
  return inMemoryOrders;
}

// Save local orders
function persistOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(inMemoryOrders));
  } catch (err) {
    console.warn('[OrderService] Could not persist orders to localStorage:', err);
  }
}

// Initialize on load
loadPersistedOrders();

// Generates or retrieves an anonymous, privacy-safe student session identifier
export function getOrCreateAnonymousStudentId(): string {
  if (typeof window === 'undefined') return 'anon-student-node';
  let token = localStorage.getItem(STUDENT_ANON_SESSION_KEY);
  if (!token) {
    const randomHex = Math.random().toString(36).substring(2, 8);
    token = `anon-student-${randomHex}`;
    localStorage.setItem(STUDENT_ANON_SESSION_KEY, token);
  }
  return token;
}

// Generates readable sequential order IDs (e.g. EC-1024, EC-1025)
function getNextOrderNumber(): { orderNumber: number; orderId: string } {
  let counter = 1024;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDER_COUNTER_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 1024) {
        counter = parsed + 1;
      }
    }
    localStorage.setItem(LOCAL_STORAGE_ORDER_COUNTER_KEY, counter.toString());
  }
  return {
    orderNumber: counter,
    orderId: `EC-${counter}`,
  };
}

// Gentle Web Audio API chime for new manager notifications
export function playOrderNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a friendly two-tone notification chord (D5 -> A5)
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.12); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Audio contexts might be blocked until user interacts with the page
  }
}

// Browser notification helper
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function triggerBrowserNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // Ignore background worker issues
    }
  }
}

// In-memory deduplication tracker (prevents double clicking within 4 seconds)
const recentSubmissionTimestamps = new Map<string, number>();

export const orderService = {
  /**
   * Create a new Student Order Intent (Campus Pre-Order Queue Request)
   * Enforces:
   * - Verified campus requirement
   * - Authentic Firestore price validation (ignoring client price)
   * - Item availability check
   * - Double-click deduplication
   * - Zero student PII exposure
   */
  async createOrder(params: {
    campusId: string;
    isCampusVerified: boolean;
    canteenId?: string;
    items: {
      menuItemId: string;
      quantity: number;
      name?: string;
    }[];
  }): Promise<ServiceResponse<OrderRequestDoc>> {
    // 1. Campus verification check
    if (!params.isCampusVerified || !params.campusId) {
      return {
        success: false,
        error: 'Scan/open your college campus access link to place a campus order.',
      };
    }

    if (!params.items || params.items.length === 0) {
      return {
        success: false,
        error: 'Please select at least one item to pre-order.',
      };
    }

    const normCampus = params.campusId.trim().toUpperCase();
    const studentId = getOrCreateAnonymousStudentId();

    // 2. Double-click deduplication guardrail
    const dedupKey = `${studentId}_${params.items.map(i => `${i.menuItemId}_${i.quantity}`).join('_')}`;
    const nowMs = Date.now();
    const lastSubmitted = recentSubmissionTimestamps.get(dedupKey);
    if (lastSubmitted && nowMs - lastSubmitted < 4000) {
      return {
        success: false,
        error: 'Order already being processed. Please wait a moment.',
      };
    }
    recentSubmissionTimestamps.set(dedupKey, nowMs);

    // 3. Fetch authentic menu catalog to validate item, availability, and authentic price
    const menuRes = await menuService.getPublishedMenu(normCampus);
    const catalog = menuRes.data || [];

    const validatedItems: OrderItem[] = [];
    let detectedCanteenId = params.canteenId || '';
    let totalEstimatedAmount = 0;

    for (const reqItem of params.items) {
      const matched = catalog.find(
        (c) => c.menuItemId === reqItem.menuItemId || c.name.toLowerCase() === reqItem.name?.toLowerCase()
      );

      if (!matched) {
        return {
          success: false,
          error: `Item "${reqItem.name || reqItem.menuItemId}" was not found in the verified campus menu.`,
        };
      }

      // Check item availability
      if (matched.available === false) {
        return {
          success: false,
          error: `"${matched.name}" is currently unavailable. Please refresh the menu.`,
        };
      }

      // Verify authentic price from Firestore record
      const groundTruthPrice = matched.price !== null && matched.price !== undefined ? matched.price : 0;
      const validQty = Math.max(1, Math.min(20, reqItem.quantity || 1));
      
      if (!detectedCanteenId && matched.canteenId) {
        detectedCanteenId = matched.canteenId;
      }

      validatedItems.push({
        menuItemId: matched.menuItemId,
        name: matched.name,
        quantity: validQty,
        price: groundTruthPrice,
        canteenId: matched.canteenId,
        category: matched.category,
      });

      totalEstimatedAmount += groundTruthPrice * validQty;
    }

    // Determine canteen display name
    const foundCanteen = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === detectedCanteenId);
    const canteenDisplayName = foundCanteen?.name || detectedCanteenId || 'Campus Canteen';

    // 4. Generate order ID and document
    const { orderNumber, orderId } = getNextOrderNumber();
    const timestamp = new Date().toISOString();

    const orderDoc: OrderRequestDoc = {
      orderId,
      orderNumber,
      studentId,
      campusId: normCampus,
      canteenId: detectedCanteenId || 'main-canteen',
      canteenName: canteenDisplayName,
      items: validatedItems,
      totalAmount: totalEstimatedAmount,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 5. Update local state & persist
    inMemoryOrders.unshift(orderDoc);
    persistOrders();

    // 6. Broadcast across tabs and notify in-app listeners
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'NEW_ORDER', order: orderDoc });
      } catch (e) {
        console.warn('Broadcast channel send notice:', e);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ecobite_order_created', { detail: orderDoc }));
    }

    // 7. Write to Firestore if connected
    if (db) {
      try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await setDoc(orderRef, orderDoc);
      } catch (err) {
        console.warn('[OrderService] Firestore write fallback to local storage:', err);
      }
    }

    return {
      success: true,
      data: orderDoc,
    };
  },

  /**
   * Update the status of an existing order request.
   * Enforces legal sequential transitions:
   * PENDING -> PREPARING -> READY -> COMPLETED (or CANCELLED)
   */
  async updateOrderStatus(
    orderId: string, 
    newStatus: OrderRequestStatus
  ): Promise<ServiceResponse<OrderRequestDoc>> {
    const existing = inMemoryOrders.find((o) => o.orderId === orderId);
    if (!existing) {
      return { success: false, error: `Order #${orderId} not found.` };
    }

    // Validate status progression
    const validTransitions: Record<OrderRequestStatus, OrderRequestStatus[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[existing.status]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition order status from ${existing.status} to ${newStatus}.`,
      };
    }

    existing.status = newStatus;
    existing.updatedAt = new Date().toISOString();
    persistOrders();

    // Broadcast status change
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'STATUS_UPDATE', order: existing });
      } catch (e) {
        console.warn('Broadcast status notice:', e);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ecobite_order_status_updated', { detail: existing }));
    }

    // Sync to Firestore
    if (db) {
      try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await setDoc(orderRef, existing, { merge: true });
      } catch (err) {
        console.warn('[OrderService] Firestore update fallback:', err);
      }
    }

    return { success: true, data: existing };
  },

  /**
   * Get all order requests for a campus, sorted newest first
   */
  async getOrdersByCampus(campusId: string): Promise<ServiceResponse<OrderRequestDoc[]>> {
    const normCampus = (campusId || 'MAIT').toUpperCase();
    loadPersistedOrders();

    if (db) {
      try {
        const colRef = collection(db, ORDERS_COLLECTION);
        const q = query(colRef, where('campusId', '==', normCampus));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: OrderRequestDoc[] = [];
          snap.forEach((d) => list.push(d.data() as OrderRequestDoc));
          
          // Merge with in-memory orders
          const map = new Map<string, OrderRequestDoc>();
          list.forEach((o) => map.set(o.orderId, o));
          inMemoryOrders.forEach((o) => {
            if (o.campusId === normCampus && !map.has(o.orderId)) {
              map.set(o.orderId, o);
            }
          });

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          inMemoryOrders = merged;
          persistOrders();
          return { success: true, data: merged };
        }
      } catch (err) {
        console.warn('[OrderService] getOrdersByCampus Firestore fallback:', err);
      }
    }

    const filtered = inMemoryOrders
      .filter((o) => o.campusId === normCampus)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, data: filtered };
  },

  /**
   * Get all orders placed by the current student session
   */
  async getStudentOrders(): Promise<ServiceResponse<OrderRequestDoc[]>> {
    const studentId = getOrCreateAnonymousStudentId();
    loadPersistedOrders();

    const filtered = inMemoryOrders
      .filter((o) => o.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, data: filtered };
  },

  /**
   * Subscribe to real-time order requests for a campus (for Canteen Managers).
   * Listens to Firestore onSnapshot, BroadcastChannel, and local storage events.
   * Returns an unsubscribe function.
   */
  subscribeToCampusOrders(
    campusId: string, 
    callback: (orders: OrderRequestDoc[], newOrderEvent?: OrderRequestDoc) => void
  ): () => void {
    const normCampus = (campusId || 'MAIT').toUpperCase();

    // Initial broadcast with current cache
    loadPersistedOrders();
    callback(inMemoryOrders.filter((o) => o.campusId === normCampus));

    // 1. Cross-tab BroadcastChannel listener
    const onBroadcast = (evt: MessageEvent) => {
      if (evt.data && evt.data.order && evt.data.order.campusId === normCampus) {
        loadPersistedOrders();
        const updatedList = inMemoryOrders.filter((o) => o.campusId === normCampus);
        callback(updatedList, evt.data.type === 'NEW_ORDER' ? evt.data.order : undefined);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', onBroadcast);
    }

    // 2. Custom Window Event listeners (same tab)
    const onOrderCreated = (evt: Event) => {
      const customEvt = evt as CustomEvent<OrderRequestDoc>;
      if (customEvt.detail && customEvt.detail.campusId === normCampus) {
        loadPersistedOrders();
        callback(inMemoryOrders.filter((o) => o.campusId === normCampus), customEvt.detail);
      }
    };

    const onStatusUpdated = () => {
      loadPersistedOrders();
      callback(inMemoryOrders.filter((o) => o.campusId === normCampus));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ecobite_order_created', onOrderCreated);
      window.addEventListener('ecobite_order_status_updated', onStatusUpdated);
      window.addEventListener('storage', onStatusUpdated);
    }

    // 3. Firestore onSnapshot realtime listener
    let firestoreUnsub: (() => void) | null = null;
    if (db) {
      try {
        const colRef = collection(db, ORDERS_COLLECTION);
        const q = query(colRef, where('campusId', '==', normCampus));
        firestoreUnsub = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const list: OrderRequestDoc[] = [];
            snap.forEach((d) => list.push(d.data() as OrderRequestDoc));
            
            // Check if there are newly added pending orders
            const prevIds = new Set(inMemoryOrders.map((o) => o.orderId));
            const newlyAdded = list.find((o) => !prevIds.has(o.orderId) && o.status === 'PENDING');

            inMemoryOrders = list.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            persistOrders();
            callback(inMemoryOrders, newlyAdded);
          }
        }, (err) => {
          console.warn('[OrderService] onSnapshot fallback to polling:', err);
        });
      } catch (err) {
        console.warn('[OrderService] Failed to set up Firestore listener:', err);
      }
    }

    // 4. Polling fallback (every 3.5 seconds) for bulletproof hackathon demo reliability
    const pollTimer = setInterval(() => {
      loadPersistedOrders();
      callback(inMemoryOrders.filter((o) => o.campusId === normCampus));
    }, 3500);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', onBroadcast);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('ecobite_order_created', onOrderCreated);
        window.removeEventListener('ecobite_order_status_updated', onStatusUpdated);
        window.removeEventListener('storage', onStatusUpdated);
      }
      if (firestoreUnsub) {
        firestoreUnsub();
      }
      clearInterval(pollTimer);
    };
  },

  /**
   * Subscribe to status updates for the student's active pre-orders.
   */
  subscribeToStudentOrders(
    callback: (orders: OrderRequestDoc[]) => void
  ): () => void {
    const studentId = getOrCreateAnonymousStudentId();

    const pushStudentOrders = () => {
      loadPersistedOrders();
      const myOrders = inMemoryOrders
        .filter((o) => o.studentId === studentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(myOrders);
    };

    pushStudentOrders();

    const onBroadcast = (evt: MessageEvent) => {
      if (evt.data?.order?.studentId === studentId) {
        pushStudentOrders();
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', onBroadcast);
    }

    const onEvent = () => pushStudentOrders();

    if (typeof window !== 'undefined') {
      window.addEventListener('ecobite_order_created', onEvent);
      window.addEventListener('ecobite_order_status_updated', onEvent);
      window.addEventListener('storage', onEvent);
    }

    const pollTimer = setInterval(pushStudentOrders, 3000);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', onBroadcast);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('ecobite_order_created', onEvent);
        window.removeEventListener('ecobite_order_status_updated', onEvent);
        window.removeEventListener('storage', onEvent);
      }
      clearInterval(pollTimer);
    };
  }
};
