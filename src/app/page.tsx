'use client';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { Library } from '@/components/library/Library';
import { BookDetail } from '@/components/book/BookDetail';
import { Landing } from '@/components/landing/Landing';
import { useEffect, useState } from 'react';

export default function Home() {
  const { currentView, hydrated, hydrateFromServer } = useStore();
  const { user, loading, error, clearError, signIn, signOut, isConfigured } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isConfigured || user)) {
      hydrateFromServer();
    }
  }, [mounted, user, isConfigured, hydrateFromServer]);

  const showLoader = !mounted || loading || (!isConfigured && !hydrated) || (isConfigured && user && !hydrated);

  if (showLoader) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888', fontFamily: 'Courier New, monospace' }}>
          LOADING...
        </span>
      </div>
    );
  }

  if (isConfigured && !user) return <Landing onSignIn={signIn} error={error} onClearError={clearError} />;

  if (currentView === 'book-detail') return <BookDetail />;
  return <Library />;
}
