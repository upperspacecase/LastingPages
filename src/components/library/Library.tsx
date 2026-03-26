import { useState, useEffect, useMemo } from 'react';
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

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(book =>
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.concepts.some(c =>
        c.text.toLowerCase().includes(q) ||
        c.personalNote.toLowerCase().includes(q) ||
        c.context.toLowerCase().includes(q)
      )
    );
  }, [books, searchQuery]);

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

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setOlResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchBooks(debouncedQuery, 4)
      .then(results => {
        if (!cancelled) { setOlResults(results); setSearching(false); }
      })
      .catch(() => {
        if (!cancelled) setSearching(false);
      });
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>LASTING PAGES</div>
        <div className={styles.meta}>
          {books.length} {books.length === 1 ? 'SOURCE' : 'SOURCES'}<br />
          {totalHighlights} {totalHighlights === 1 ? 'HIGHLIGHT' : 'HIGHLIGHTS'}
        </div>
      </header>

      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="search or add a book..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => { setSearchQuery(''); setOlResults([]); }}>
            &times;
          </button>
        )}
      </div>

      {searchQuery.trim() && matchingHighlights.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}>
            {matchingHighlights.length} MATCHING {matchingHighlights.length === 1 ? 'HIGHLIGHT' : 'HIGHLIGHTS'}
          </div>
          <div className={styles.highlightResults}>
            {matchingHighlights.map(({ concept, book }) => (
              <button key={concept.id} className={styles.highlightResult} onClick={() => selectBook(book.id)}>
                <span className={styles.highlightSource}>{book.title}</span>
                <span className={styles.highlightText}>{concept.text}</span>
                {concept.personalNote && <span className={styles.highlightNote}>{concept.personalNote}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        {filteredBooks.length > 0 ? (
          <div className={styles.grid}>
            {filteredBooks.map(book => (
              <button key={book.id} className={styles.card} onClick={() => selectBook(book.id)}>
                {book.coverImage ? (
                  <img src={book.coverImage} alt="" className={styles.cardImage} />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <span className={styles.cardPlaceholderText}>{book.title}</span>
                  </div>
                )}
                <div className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{book.title}</span>
                  <span className={styles.cardAuthor}>{book.author}</span>
                  <span className={styles.cardCount}>
                    {book.concepts.length} {book.concepts.length === 1 ? 'highlight' : 'highlights'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : !searchQuery.trim() ? (
          <div className={styles.empty}>
            search for a book above to add it to your library.
          </div>
        ) : null}
      </section>

      {searchQuery.trim() && debouncedQuery.length >= 2 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}>ADD TO LIBRARY</div>
          {searching && <p className={styles.searchStatus}>searching...</p>}
          {newOlResults.length > 0 && (
            <div className={styles.olResults}>
              {newOlResults.map(r => (
                <button key={r.olKey} className={styles.olResult} onClick={() => handleAddFromOL(r)}>
                  {r.coverUrl ? (
                    <img src={r.coverUrl} alt="" className={styles.olCover} />
                  ) : (
                    <div className={styles.olNoCover} />
                  )}
                  <div className={styles.olInfo}>
                    <span className={styles.olTitle}>{r.title}</span>
                    <span className={styles.olAuthor}>{r.author}{r.year ? ` (${r.year})` : ''}</span>
                  </div>
                  <span className={styles.olAdd}>+ ADD</span>
                </button>
              ))}
            </div>
          )}
          {!searching && (
            <button className={styles.manualAdd} onClick={handleAddManual}>
              + ADD &ldquo;{searchQuery.trim()}&rdquo; MANUALLY
            </button>
          )}
        </section>
      )}
    </div>
  );
}
