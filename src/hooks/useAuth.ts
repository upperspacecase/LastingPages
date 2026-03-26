import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user') return;
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for sign-in.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
      console.error('Sign-in error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, loading, error, clearError, signIn, signOut, isConfigured };
}
