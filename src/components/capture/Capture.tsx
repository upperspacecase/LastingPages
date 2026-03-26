import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { searchBooks, type BookSearchResult } from '@/utils/openLibrary';
import { useDebounce } from '@/hooks/useDebounce';
import type { Book, SourceType } from '@/types';
import styles from './Capture.module.css';

export function Capture() {
  const { addBook, setView, selectBook } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<BookSearchResult | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('book');

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || selected) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchBooks(debouncedQuery, 6)
      .then(r => {
        if (!cancelled) { setResults(r); setSearching(false); }
      })
      .catch(() => {
        if (!cancelled) setSearching(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery, selected]);

  const handleSelect = (result: BookSearchResult) => {
    setSelected(result);
    setQuery(result.title);
    setResults([]);
  };

  const handleSubmit = () => {
    if (!selected && !query.trim()) return;
    const id = `b-${Date.now()}`;
    const book: Book = {
      id,
      title: selected ? selected.title : query.trim(),
      author: selected ? selected.author : '',
      type: sourceType,
      coverColor: '#e0e0e0',
      coverAccent: '#d0d0d0',
      coverImage: selected?.coverUrl,
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      concepts: [],
      notes: '',
    };
    addBook(book);
    selectBook(id);
  };

  const clear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => setView('library')}>
          &larr; BACK
        </button>
        <span className={styles.headerTitle}>ADD SOURCE</span>
        <div className={styles.spacer} />
      </header>

      <div className={styles.typeRow}>
        {(['book', 'podcast', 'article', 'video', 'other'] as SourceType[]).map(t => (
          <button
            key={t}
            className={`${styles.typeChip} ${sourceType === t ? styles.typeActive : ''}`}
            onClick={() => setSourceType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="search by title or author..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          autoFocus
        />
        {query && (
          <button className={styles.clearBtn} onClick={clear}>&times;</button>
        )}
      </div>

      {searching && <p className={styles.status}>searching...</p>}

      {selected && (
        <div className={styles.selectedCard}>
          {selected.coverUrl && (
            <img src={selected.coverUrl} alt="" className={styles.selectedCover} />
          )}
          <div className={styles.selectedInfo}>
            <span className={styles.selectedTitle}>{selected.title}</span>
            <span className={styles.selectedAuthor}>{selected.author}</span>
            {selected.year && <span className={styles.selectedMeta}>{selected.year}</span>}
          </div>
          <button className={styles.changeBtn} onClick={clear}>CHANGE</button>
        </div>
      )}

      {results.length > 0 && !selected && (
        <div className={styles.results}>
          {results.map(r => (
            <button key={r.olKey} className={styles.resultItem} onClick={() => handleSelect(r)}>
              {r.coverUrl ? (
                <img src={r.coverUrl} alt="" className={styles.resultCover} />
              ) : (
                <div className={styles.resultNoCover} />
              )}
              <div className={styles.resultInfo}>
                <span className={styles.resultTitle}>{r.title}</span>
                <span className={styles.resultAuthor}>
                  {r.author}{r.year ? ` (${r.year})` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {debouncedQuery.length >= 2 && !searching && results.length === 0 && !selected && (
        <p className={styles.noResults}>nothing found -- just type the title and continue.</p>
      )}

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!selected && !query.trim()}
      >
        ADD TO LIBRARY
      </button>
    </div>
  );
}
