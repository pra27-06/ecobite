/**
 * EcoBite AI - Authentication Service Layer
 * 
 * Provides unified authentication methods:
 * - Email & Password authentication
 * - Anonymous student guest sessions
 * - Synchronized Firestore user profile fetching
 * - Graceful fallback mode when Firebase credentials are not yet configured
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import type { UserDoc, UserRole, ServiceResponse } from '../types';

export const authService = {
  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth) {
      // In unconfigured demo mode, notify with null
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Fetch a user's Firestore profile document
   */
  async getUserProfile(userId: string): Promise<ServiceResponse<UserDoc>> {
    if (!db) {
      return {
        success: false,
        error: 'Firestore is not initialized. Check Firebase environment configuration.',
      };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return {
          success: true,
          data: userSnap.data() as UserDoc,
        };
      }

      return {
        success: false,
        error: 'User profile document not found in Firestore.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve user profile.';
      return { success: false, error: message };
    }
  },

  /**
   * Sign in with Email and Password
   */
  async signInWithEmail(email: string, pass: string): Promise<ServiceResponse<User>> {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase Auth is unconfigured. Set VITE_FIREBASE_* in your environment.',
      };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      return { success: true, data: credential.user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      return { success: false, error: message };
    }
  },

  /**
   * Register a new student user and create their Firestore user profile
   */
  async signUpWithEmail(
    email: string,
    pass: string,
    name: string,
    campusId: string | null = null
  ): Promise<ServiceResponse<User>> {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase Auth is unconfigured. Set VITE_FIREBASE_* in your environment.',
      };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = credential.user;

      // Create user document in Firestore if db is active
      if (db) {
        const newUserDoc: UserDoc = {
          userId: user.uid,
          name: name.trim() || 'Student',
          email: user.email || email,
          role: 'student' as UserRole,
          campusId: campusId,
          campusVerified: false, // Must be verified via official QR, never defaulted to true
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          ...newUserDoc,
          serverTimestamp: serverTimestamp(),
        });
      }

      return { success: true, data: user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      return { success: false, error: message };
    }
  },

  /**
   * Sign in anonymously for frictionless exploration
   */
  async signInAnonymously(): Promise<ServiceResponse<User>> {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase Auth is unconfigured. Running in local guest mode.',
      };
    }

    try {
      const credential = await signInAnonymously(auth);
      return { success: true, data: credential.user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Anonymous sign-in failed.';
      return { success: false, error: message };
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<ServiceResponse<void>> {
    if (!auth) {
      return { success: true };
    }

    try {
      await signOut(auth);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed.';
      return { success: false, error: message };
    }
  },

  /**
   * Helper to check if Firebase is configured
   */
  isConfigured(): boolean {
    return isFirebaseConfigured;
  },
};
