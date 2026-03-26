import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import styles from './Library.module.css';

export function Library() {
  const { books, setView, selectBook, searchQuery, setSearchQuery } = useStore();

  const totalHighlights = books.reduce((sum, b) => sum + b.concepts.length, 0);

  const matchingHighlights = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { concept: typeof books[0]['concepts'][0]; book: typeof books[0] }[] = [];
    books.forEach(book => {
      book.concepts.forEach(concept => {
        if (
          concept.text.toLowerCase().includes(q) ||
          concept.context.toLowerCase().includes(q) ||
          concept.personalNote.toLowerCase().includes(q) ||
          (concept.skill && concept.skill.toLowerCase().includes(q))
        ) {
          matches.push({ concept, book });
        }
      });
    });
    return matches;
  }, [books, searchQuery]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(book =>
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.concepts.some(c =>
        c.text.toLowerCase().includes(q) ||
        c.context.toLowerCase().includes(q) ||
        c.personalNote.toLowerCase().includes(q)
      )
    );
  }, [books, searchQuery]);

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
          placeholder="search everything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
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
              <button
                key={concept.id}
                className={styles.highlightResult}
                onClick={() => selectBook(book.id)}
              >
                <span className={styles.highlightSource}>{book.title}</span>
                <span className={styles.highlightText}>{concept.text}</span>
                {concept.personalNote && (
                  <span className={styles.highlightNote}>{concept.personalNote}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        {searchQuery.trim() && (
          <div className={styles.sectionLabel}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'SOURCE' : 'SOURCES'}
          </div>
        )}
        {filteredBooks.length > 0 ? (
          <div className={styles.grid}>
            {filteredBooks.map(book => (
              <button
                key={book.id}
                className={styles.card}
                onClick={() => selectBook(book.id)}
              >
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
        ) : (
          <div className={styles.empty}>
            {searchQuery.trim()
              ? 'no results.'
              : 'your library is empty.'}
          </div>
        )}
      </section>

      <button className={styles.addButton} onClick={() => setView('capture')}>
        + ADD SOURCE
      </button>
    </div>
  );
}
