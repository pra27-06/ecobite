/**
 * EcoBite AI - Firebase Configuration & Initialization
 * 
 * Provides unified, environment-variable-backed access to:
 * - Firebase Authentication
 * - Cloud Firestore
 * - Firebase Storage
 * 
 * Includes defensive fallback handling so the application never crashes
 * when environment variables are missing or unconfigured.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseEnvConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if actual configuration values are present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  !firebaseConfig.apiKey.includes('placeholder')
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
  } catch (error) {
    console.warn('[EcoBite Firebase] Failed to initialize Firebase SDK with provided credentials:', error);
  }
} else {
  // Graceful development notice
  if (import.meta.env.DEV) {
    console.info(
      '[EcoBite Firebase] No live Firebase credentials configured in environment variables. ' +
      'App is running in local fallback/demo mode. See .env.example for setup instructions.'
    );
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
