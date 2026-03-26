'use client';

import { useStore } from '@/store/useStore';
import { Library } from '@/components/library/Library';
import { BookDetail } from '@/components/book/BookDetail';
import { Capture } from '@/components/capture/Capture';
import { useEffect, useState } from 'react';

export default function Home() {
  const { currentView, hydrateFromServer } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      hydrateFromServer();
    }
  }, [mounted, hydrateFromServer]);

  if (!mounted) return null;

  const view = (currentView === 'book-detail' || currentView === 'capture')
    ? currentView
    : 'library';

  return (
    <>
      {view === 'library' && <Library />}
      {view === 'book-detail' && <BookDetail />}
      {view === 'capture' && <Capture />}
    </>
  );
}
