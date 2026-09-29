import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { AuthContext } from './AuthContextDefinition';
import { authService } from '../services/authService';
import type { UserDoc } from '../types';

export { type AuthContextType } from './AuthContextDefinition';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch matching Firestore profile document
        const profileRes = await authService.getUserProfile(user.uid);
        if (profileRes.success && profileRes.data) {
          setUserDoc(profileRes.data);
        } else {
          // Construct baseline profile in memory
          setUserDoc({
            userId: user.uid,
            name: user.displayName || (user.isAnonymous ? 'Guest Student' : 'Student'),
            email: user.email || '',
            role: 'student',
            campusId: null,
            campusVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUserDoc(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const res = await authService.signInWithEmail(email, pass);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed.');
      return false;
    }
    return true;
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const res = await authService.signUpWithEmail(email, pass, name);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Registration failed.');
      return false;
    }
    return true;
  };

  const signInAnonymously = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const res = await authService.signInAnonymously();
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Anonymous login failed.');
      return false;
    }
    return true;
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    await authService.signOut();
    setCurrentUser(null);
    setUserDoc(null);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const setSimulatedRole = (
    role: import('../types').UserRole, 
    campusId: string | null,
    extra?: { campusName?: string; canteenName?: string; name?: string }
  ) => {
    setUserDoc((prev) => {
      const isPrivileged = role === 'campus_admin' || role === 'canteen_owner' || role === 'canteen_manager';
      const roleName = extra?.name || (role === 'campus_admin' 
        ? 'Campus Administrator' 
        : (role === 'canteen_owner' || role === 'canteen_manager')
        ? (extra?.canteenName ? `${extra.canteenName} Manager` : 'Canteen Manager')
        : 'Guest Student');
      const roleEmail = role === 'campus_admin' 
        ? 'admin@mait.ac.in' 
        : (role === 'canteen_owner' || role === 'canteen_manager')
        ? 'manager@campus.ac.in' 
        : '';

      const normCampus = campusId || 'MAIT';

      if (!prev) {
        return {
          userId: (role === 'canteen_owner' || role === 'canteen_manager') ? 'canteen-manager-evaluator' : 'admin-evaluator',
          name: roleName,
          email: roleEmail,
          role,
          campusId: normCampus,
          campusName: extra?.campusName || (normCampus === 'MAIT' ? 'Maharaja Agrasen Institute of Technology' : `${normCampus} Campus`),
          canteenName: extra?.canteenName || 'Main Campus Canteen',
          campusVerified: isPrivileged,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        ...prev,
        name: extra?.name || prev.name,
        role,
        campusId: normCampus,
        campusName: extra?.campusName || prev.campusName,
        canteenName: extra?.canteenName || prev.canteenName,
        campusVerified: isPrivileged ? true : prev.campusVerified,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userDoc,
        isAuthenticated: Boolean(currentUser),
        isAnonymous: Boolean(currentUser?.isAnonymous),
        isLoading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInAnonymously,
        signOut,
        clearError,
        setSimulatedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
