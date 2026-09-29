import { createContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserDoc, UserRole } from '../types';

export interface AuthContextType {
  currentUser: User | null;
  userDoc: UserDoc | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  signInAnonymously: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setSimulatedRole: (role: UserRole, campusId: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
