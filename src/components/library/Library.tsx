'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { searchBooks, type BookSearchResult } from '@/utils/openLibrary';
import { useDebounce } from '@/hooks/useDebounce';
import type { Book } from '@/types';
import styles from './Library.module.css';

export function Library() {
  const { books, addBook, selectBook, searchQuery, setSearchQuery } = useStore();
  const [olResults, setOlResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);
  const totalHighlights = books.reduce((sum, b) => sum + b.concepts.length, 0);

  // Carousel state
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollState = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    isDragging: false,
    lastX: 0,
    dragDistance: 0,
  });
  const rafRef = useRef<number>(0);
  const searchActiveRef = useRef(false);

  useEffect(() => {
    searchActiveRef.current = !!searchQuery.trim();
  }, [searchQuery]);

  // Animation loop
  useEffect(() => {
    if (books.length === 0) return;

    const CARD_WIDTH = 220;
    const AUTO_SPEED = 0.3;
    const state = scrollState.current;

    function animate() {
      if (!state.isDragging) {
        state.target += state.velocity;
        state.velocity *= 0.95;
        if (!searchActiveRef.current) {
          state.target += AUTO_SPEED;
        }
      }

      state.current += (state.target - state.current) * 0.1;

      const count = cardRefs.current.filter(Boolean).length;
      if (count === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      const totalSetWidth = count * CARD_WIDTH;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        let vPos = index * CARD_WIDTH - state.current;
        while (vPos < -totalSetWidth / 2) vPos += totalSetWidth;
        while (vPos > totalSetWidth / 2) vPos -= totalSetWidth;

        if (Math.abs(vPos) < window.innerWidth) {
          card.style.display = 'block';
          const progress = vPos / (window.innerWidth / 1.5);
          const z = -Math.pow(Math.abs(progress), 2) * 500;
          const rotateY = progress * 45;
          card.style.transform = `translateX(${vPos}px) translateZ(${z}px) rotateY(${rotateY}deg)`;
          card.style.opacity = String(Math.max(0, 1 - Math.pow(Math.abs(progress), 3)));
        } else {
          card.style.display = 'none';
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [books.length]);

  // Drag handlers
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const state = scrollState.current;

    const onDown = (x: number) => {
      state.isDragging = true;
      state.lastX = x;
      state.dragDistance = 0;
      state.velocity = 0;
      vp.style.cursor = 'grabbing';
    };
    const onUp = () => {
      state.isDragging = false;
      vp.style.cursor = 'grab';
    };
    const onMove = (x: number) => {
      if (!state.isDragging) return;
      const delta = x - state.lastX;
      state.lastX = x;
      state.dragDistance += Math.abs(delta);
      state.target -= delta * 1.5;
      state.velocity = -delta * 0.5;
    };

    const md = (e: MouseEvent) => onDown(e.clientX);
    const mu = () => onUp();
    const mm = (e: MouseEvent) => onMove(e.clientX);
    const ts = (e: TouchEvent) => onDown(e.touches[0].clientX);
    const te = () => onUp();
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX);

    vp.addEventListener('mousedown', md);
    window.addEventListener('mouseup', mu);
    window.addEventListener('mousemove', mm);
    vp.addEventListener('touchstart', ts);
    window.addEventListener('touchend', te);
    window.addEventListener('touchmove', tm);

    return () => {
      vp.removeEventListener('mousedown', md);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('mousemove', mm);
      vp.removeEventListener('touchstart', ts);
      window.removeEventListener('touchend', te);
      window.removeEventListener('touchmove', tm);
    };
  }, []);

  const handleCardClick = useCallback((bookId: string) => {
    if (scrollState.current.dragDistance > 5) return;
    selectBook(bookId);
  }, [selectBook]);

  // Search: highlights
  const matchingHighlights = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { concept: typeof books[0]['concepts'][0]; book: typeof books[0] }[] = [];
    books.forEach(book => {
      book.concepts.forEach(concept => {
        if (
          concept.text.toLowerCase().includes(q) ||
          concept.context.toLowerCase().includes(q) ||
          concept.personalNote.toLowerCase().includes(q)
        ) {
          matches.push({ concept, book });
        }
      });
    });
    return matches;
  }, [books, searchQuery]);

  // Open Library
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setOlResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchBooks(debouncedQuery, 4)
      .then(r => { if (!cancelled) { setOlResults(r); setSearching(false); } })
      .catch(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleAddFromOL = (result: BookSearchResult) => {
    const id = `b-${Date.now()}`;
    const book: Book = {
      id,
      title: result.title,
      author: result.author,
      type: 'book',
      coverColor: '#e0e0e0',
      coverAccent: '#d0d0d0',
      coverImage: result.coverUrl,
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      concepts: [],
      notes: '',
    };
    addBook(book);
    setSearchQuery('');
    setOlResults([]);
  };

  const handleAddManual = () => {
    if (!searchQuery.trim()) return;
    const id = `b-${Date.now()}`;
    const book: Book = {
      id,
      title: searchQuery.trim(),
      author: '',
      type: 'book',
      coverColor: '#e0e0e0',
      coverAccent: '#d0d0d0',
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      concepts: [],
      notes: '',
    };
    addBook(book);
    setSearchQuery('');
    setOlResults([]);
  };

  const newOlResults = olResults.filter(r =>
    !books.some(b => b.title.toLowerCase() === r.title.toLowerCase())
  );

  const showPanel = searchQuery.trim().length >= 2;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>LASTING PAGES</div>
        <div className={styles.meta}>
          {books.length} {books.length === 1 ? 'SOURCE' : 'SOURCES'}<br />
          {totalHighlights} {totalHighlights === 1 ? 'HIGHLIGHT' : 'HIGHLIGHTS'}
        </div>
      </header>

      {books.length > 0 ? (
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.strip}>
            {books.map((book, i) => (
              <div
                key={book.id}
                ref={el => { cardRefs.current[i] = el; }}
                className={styles.card}
                onClick={() => handleCardClick(book.id)}
              >
                {book.coverImage ? (
                  <img src={book.coverImage} alt="" className={styles.cardImg} />
                ) : (
                  <div className={styles.cardFallback}>
                    <span className={styles.cardFallbackText}>{book.title}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyCenter}>
          <p className={styles.emptyText}>your library is empty.</p>
        </div>
      )}

      {showPanel && (
        <div className={styles.resultsPanel}>
          {matchingHighlights.length > 0 && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsLabel}>
                {matchingHighlights.length} MATCHING {matchingHighlights.length === 1 ? 'HIGHLIGHT' : 'HIGHLIGHTS'}
              </div>
              {matchingHighlights.slice(0, 5).map(({ concept, book }) => (
                <button key={concept.id} className={styles.resultRow} onClick={() => selectBook(book.id)}>
                  <span className={styles.resultSource}>{book.title}</span>
                  <span className={styles.resultText}>{concept.text}</span>
                </button>
              ))}
            </div>
          )}
          {searching && (
            <p className={styles.searchingText}>searching...</p>
          )}
          {newOlResults.length > 0 && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsLabel}>ADD TO LIBRARY</div>
              {newOlResults.map(r => (
                <button key={r.olKey} className={styles.resultRow} onClick={() => handleAddFromOL(r)}>
                  <span className={styles.resultText}>{r.title}</span>
                  <span className={styles.resultSub}>{r.author}{r.year ? ` (${r.year})` : ''}</span>
                  <span className={styles.resultAdd}>+ ADD</span>
                </button>
              ))}
            </div>
          )}
          {!searching && (
            <button className={styles.manualAdd} onClick={handleAddManual}>
              + ADD &ldquo;{searchQuery.trim()}&rdquo; MANUALLY
            </button>
          )}
        </div>
      )}

      <div className={styles.bottomInput}>
        <span className={styles.inputLabel}>SEARCH OR ADD</span>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="search or add a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => { setSearchQuery(''); setOlResults([]); }}>
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
