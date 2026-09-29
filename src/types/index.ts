/**
 * EcoBite AI - Core TypeScript Type Definitions
 * Data models aligned with Firestore schema and multi-campus architecture.
 */

// User Roles
export type UserRole = 'student' | 'campus_admin' | 'canteen_owner';

// User and Session (Firestore: users/{userId})
export interface UserDoc {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  campusId: string | null;
  campusVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatible alias for existing frontend references
export type UserProfile = UserDoc;

// Campus Verification Access (Firestore: campusAccess/{accessId})
export type CampusAccessMethod = 'qr' | 'institutional_email' | 'admin_approval';
export type CampusAccessStatus = 'active' | 'expired' | 'revoked';

export interface CampusAccessDoc {
  accessId: string;
  userId: string;
  campusId: string;
  status: CampusAccessStatus;
  verifiedAt: string;
  expiresAt?: string | null;
  method: CampusAccessMethod;
  createdAt: string;
}

// Campus Metadata (Firestore: campuses/{campusId})
export interface CampusDoc {
  campusId: string; // e.g., 'mait'
  name: string; // 'Maharaja Agrasen Institute of Technology'
  code: string; // 'MAIT'
  city: string; // 'Delhi'
  verified: boolean;
  qrAccessEnabled: boolean;
  canteensCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Canteens & Food Counters (Firestore: canteens/{canteenId})
export interface CanteenDoc {
  canteenId: string;
  campusId: string; // Foreign key to CampusDoc
  name: string; // e.g., 'Main Canteen', 'Nescafe Booth'
  location: string; // e.g., 'Block 1 Ground Floor'
  active: boolean;
  openingHours?: string;
  createdAt: string;
  updatedAt: string;
}

// Core Food Categories
export type FoodCategory = 'MEAL' | 'SNACK' | 'BEVERAGE' | 'DESSERT';

// Menu Items (Firestore: menuItems/{menuItemId})
export interface MenuItemDoc {
  menuItemId: string;
  campusId: string; // Campus isolation key
  canteenId: string; // Canteen identifier
  name: string; // e.g., 'Paneer Sandwich'
  category: string; // raw category, e.g. 'sandwiches', 'indian-meals'
  foodCategory?: FoodCategory; // Normalized canonical category
  price: number; // Stored in INR (₹)
  available: boolean;
  description: string;
  imageUrl?: string;
  verified: boolean;
  source: string; // 'MAIT menu board' | 'admin_portal'
  caloriesApprox?: number;
  tags?: string[];
  variants?: Record<string, number>; // e.g. { small: 40, medium: 60, large: 80 }
  updatedAt: string;
}

// General Food Intelligence (Firestore: foodProfiles/{foodId})
export interface FoodNutritionSummary {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface FoodProfileDoc {
  foodId: string;
  name: string;
  aliases: string[];
  nutrition: FoodNutritionSummary;
  healthScore: number; // 0 - 10
  sustainabilityScore: number; // 0 - 10
  affordabilityScore?: number; // 0 - 10
  description?: string;
  category?: string;
  updatedAt: string;
}

// Smart Swap Recommendation (Firestore: smartSwaps/{swapId})
export interface SmartSwapDoc {
  swapId: string;
  campusId: string; // Campus isolation key
  originalFoodId: string;
  alternativeMenuItemId: string; // Must reference an authentic MenuItemDoc in Firestore
  reasoning: string;
  active: boolean;
  moneySavedEstimate?: number;
  updatedAt: string;
}

// Impact Tracking (Firestore: impactLogs/{logId})
export interface ImpactLogDoc {
  logId: string;
  userId: string;
  campusId: string;
  originalFood: string;
  selectedAlternative: string;
  originalPrice?: number;
  alternativePrice?: number;
  moneySaved: number; // In INR (₹)
  estimatedImpact: {
    co2SavedKg: number;
  };
  timestamp: string;
}

// Service result helper types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// AI Food Analysis Result Types
export type AIConfidenceLevel = 'high' | 'medium' | 'low';

export interface AIFoodAnalysisResult {
  foodName: string;
  hindiName?: string;
  category?: FoodCategory;
  confidence: AIConfidenceLevel;
  confidenceScore: number; // 0.0 to 1.0
  isUncertain: boolean;
  possibleAlternatives?: string[]; // Candidate foods if uncertain or ambiguous
  healthScore: number; // 0.0 - 10.0 (Body)
  affordabilityScore: number; // 0.0 - 10.0 (Wallet)
  sustainabilityScore: number; // 0.0 - 10.0 (Planet)
  nutrition: {
    calories: number; // kcal
    protein: number; // g
    carbs: number; // g
    fat: number; // g
  };
  explanation: {
    body: string;
    wallet: string;
    planet: string;
  };
  cautions: string[];
  isEstimate: boolean;
  disclaimer: string;
  analyzedAt: string;
  sourceType: 'text_search' | 'image_upload' | 'demo_sample';
}

// Smart Swap Recommendation Engine Types
export interface SmartSwapRecommendation {
  name: string;
  menuItemId?: string;
  canteenId?: string;
  canteenName?: string;
  canteenLocation?: string;
  foodCategory?: FoodCategory;
  price: number;
  healthScore: number;
  sustainabilityScore: number;
  moneySaved: number;
  isAvailable: boolean;
  isCampusVerified: boolean;
  whyReasons: string[];
  source: 'firestore_campus' | 'general_benchmark';
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface SmartSwapResult {
  success: boolean;
  isCampusVerified: boolean;
  hasSwap: boolean;
  originalFood: {
    name: string;
    price?: number;
    foodCategory?: FoodCategory;
    healthScore: number;
    sustainabilityScore: number;
    source: string;
  };
  recommendedSwap?: SmartSwapRecommendation;
  noSwapReason?: string;
}

// Demand Signal Event Types
export type DemandEventType = 'SEARCH' | 'SMART_SWAP_ACCEPTED' | 'SMART_SWAP_REJECTED';

export interface DemandSignalDoc {
  signalId?: string;
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
  timestamp: string;
}

export interface DemandScoreWeights {
  search: number;
  swapAccepted: number;
  swapRejected: number;
}

export const DEFAULT_DEMAND_WEIGHTS: DemandScoreWeights = {
  search: 1,
  swapAccepted: 3,
  swapRejected: -2,
};

// Canteen Owner Student Demand Intelligence Types
export interface CanteenDemandItem {
  itemId: string;
  name: string;
  category: FoodCategory;
  canteenId: string;
  canteenName: string;
  price: number;
  searchInterest: number;
  swapAcceptedCount: number;
  swapRejectedCount: number;
  demandScore: number;
  interestLevel: 'high' | 'medium' | 'lower';
  acceptanceStatus: 'strong' | 'moderate' | 'lower_acceptance';
  recommendation: string;
  isAvailable: boolean;
  isDemoSample?: boolean;
}

export interface CanteenDemandOverview {
  campusId: string;
  date: string;
  totalSignalsToday: number;
  totalSearchesToday: number;
  totalSwapsAcceptedToday: number;
  totalSwapsRejectedToday: number;
  mostDemandedItem: string;
  mostAcceptedSwap: string;
  mostRejectedSwap: string;
  isDemoSample?: boolean;
}
