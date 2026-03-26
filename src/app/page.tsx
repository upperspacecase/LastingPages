'use client';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { Library } from '@/components/library/Library';
import { BookDetail } from '@/components/book/BookDetail';
import { Landing } from '@/components/landing/Landing';
import { useEffect, useState } from 'react';

export default function Home() {
  const { currentView, hydrateFromServer } = useStore();
  const { user, loading, signIn, isConfigured } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isConfigured || user)) {
      hydrateFromServer();
    }
  }, [mounted, user, isConfigured, hydrateFromServer]);

  if (!mounted || loading) return null;

  if (isConfigured && !user) return <Landing onSignIn={signIn} />;

  if (currentView === 'book-detail') return <BookDetail />;
  return <Library />;
}
