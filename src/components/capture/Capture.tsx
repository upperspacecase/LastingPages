import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { searchBooks, type BookSearchResult } from '@/utils/openLibrary';
import { useDebounce } from '@/hooks/useDebounce';
import type { Book, Concept } from '@/types';
import styles from './Capture.module.css';

type CaptureStep = 'book' | 'concept' | 'note' | 'done';

const COVER_COLORS = [
  { color: '#3B5998', accent: '#8B9DC3' },
  { color: '#6B4E3D', accent: '#C4956A' },
  { color: '#87CEEB', accent: '#4682B4' },
  { color: '#2E8B57', accent: '#90EE90' },
  { color: '#9370DB', accent: '#DDA0DD' },
  { color: '#CD5C5C', accent: '#F08080' },
  { color: '#708090', accent: '#B0C4DE' },
  { color: '#DAA520', accent: '#F0E68C' },
];

export function Capture() {
  const { books, addBook, addConcept, setView, selectBook } = useStore();

  const [step, setStep] = useState<CaptureStep>('book');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BookSearchResult | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [conceptText, setConceptText] = useState('');
  const [conceptContext, setConceptContext] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 350);

  const existingBook = selectedBookId ? books.find((b) => b.id === selectedBookId) : null;

  // Live search via Open Library
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || selectedResult || selectedBookId) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchBooks(debouncedQuery, 6).then((results) => {
      if (!cancelled) {
        setSearchResults(results);
        setIsSearching(false);
      }
    }).catch(() => {
      if (!cancelled) setIsSearching(false);
    });

    return () => { cancelled = true; };
  }, [debouncedQuery, selectedResult, selectedBookId]);

  const handleSelectSearchResult = (result: BookSearchResult) => {
    setSelectedResult(result);
    setSearchQuery(result.title);
    setSearchResults([]);
  };

  const handleBookSubmit = () => {
    // Existing book from library
    if (selectedBookId) {
      setStep('concept');
      return;
    }

    // From Open Library search result
    if (selectedResult) {
      const colors = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
      const id = `b-${Date.now()}`;
      const newBook: Book = {
        id,
        title: selectedResult.title,
        author: selectedResult.author,
        coverColor: colors.color,
        coverAccent: colors.accent,
        coverImage: selectedResult.coverUrl,
        dateAdded: new Date().toISOString(),
        lastRevisited: null,
        concepts: [],
        notes: '',
      };
      addBook(newBook);
      setSelectedBookId(id);
      setStep('concept');
      return;
    }

    // Manual entry (no search result selected)
    if (!searchQuery.trim()) return;
    const colors = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
    const id = `b-${Date.now()}`;
    const newBook: Book = {
      id,
      title: searchQuery.trim(),
      author: '',
      coverColor: colors.color,
      coverAccent: colors.accent,
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      concepts: [],
      notes: '',
    };
    addBook(newBook);
    setSelectedBookId(id);
    setStep('concept');
  };

  const handleConceptSubmit = () => {
    if (!conceptText.trim() || !selectedBookId) return;

    const concept: Concept = {
      id: `c-${Date.now()}`,
      bookId: selectedBookId,
      text: conceptText.trim(),
      context: conceptContext.trim(),
      personalNote: personalNote.trim(),
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      timesRevisited: 0,
      retentionDays: 0,
    };
    addConcept(selectedBookId, concept);
    setStep('done');
  };

  const handleAddAnother = () => {
    setConceptText('');
    setConceptContext('');
    setPersonalNote('');
    setShowMoreFields(false);
    setStep('concept');
  };

  const handleFinish = () => {
    if (selectedBookId) {
      selectBook(selectedBookId);
    } else {
      setView('library');
    }
  };

  const clearSearch = () => {
    setSelectedResult(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBookId(null);
  };

  const currentBook = existingBook || books.find((b) => b.id === selectedBookId);

  return (
    <motion.div
      className={styles.capture}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => setView('library')}>
          &larr;
        </button>
        <h2 className={styles.headerTitle}>Capture</h2>
        <div className={styles.headerSpacer} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Book Selection */}
        {step === 'book' && (
          <motion.div
            key="book"
            className={styles.stepContainer}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className={styles.stepQuestion}>Which book is this from?</h3>

            {/* Search input */}
            {!selectedBookId && (
              <div className={styles.searchArea}>
                <div className={styles.searchInputWrap}>
                  <input
                    className={styles.searchInput}
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedResult(null);
                    }}
                    autoFocus
                  />
                  {(searchQuery || selectedResult) && (
                    <button className={styles.searchClear} onClick={clearSearch}>
                      &times;
                    </button>
                  )}
                </div>

                {/* Loading indicator */}
                {isSearching && (
                  <p className={styles.searchStatus}>Reading alongside you...</p>
                )}

                {/* Selected result preview */}
                {selectedResult && (
                  <motion.div
                    className={styles.selectedResultCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedResult.coverUrl && (
                      <img
                        src={selectedResult.coverUrl}
                        alt=""
                        className={styles.selectedResultCover}
                      />
                    )}
                    <div className={styles.selectedResultInfo}>
                      <span className={styles.selectedResultTitle}>{selectedResult.title}</span>
                      <span className={styles.selectedResultAuthor}>{selectedResult.author}</span>
                      {selectedResult.year && (
                        <span className={styles.selectedResultMeta}>
                          {selectedResult.year}
                          {selectedResult.pageCount ? ` · ${selectedResult.pageCount} pages` : ''}
                        </span>
                      )}
                    </div>
                    <button className={styles.selectedResultChange} onClick={clearSearch}>
                      Change
                    </button>
                  </motion.div>
                )}

                {/* Search results dropdown */}
                {searchResults.length > 0 && !selectedResult && (
                  <motion.div
                    className={styles.searchResults}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {searchResults.map((result) => (
                      <button
                        key={result.olKey}
                        className={styles.searchResultItem}
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        {result.coverUrl ? (
                          <img
                            src={result.coverUrl}
                            alt=""
                            className={styles.searchResultCover}
                          />
                        ) : (
                          <div className={styles.searchResultNoCover}>
                            <span className={styles.searchResultNoCoverText}>No cover</span>
                          </div>
                        )}
                        <div className={styles.searchResultInfo}>
                          <span className={styles.searchResultTitle}>{result.title}</span>
                          <span className={styles.searchResultAuthor}>
                            {result.author}
                            {result.year ? ` (${result.year})` : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* No results */}
                {debouncedQuery.length >= 2 && !isSearching && searchResults.length === 0 && !selectedResult && (
                  <p className={styles.searchNoResults}>
                    No books found — you can still add it manually below.
                  </p>
                )}
              </div>
            )}

            {/* Existing books from library */}
            {books.length > 0 && !selectedResult && !selectedBookId && (
              <div className={styles.existingBooks}>
                <p className={styles.orDivider}>or pick from your library</p>
                {books.map((book) => (
                  <button
                    key={book.id}
                    className={styles.bookOption}
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedResult(null);
                    }}
                  >
                    {book.coverImage ? (
                      <img src={book.coverImage} alt="" className={styles.bookOptionThumb} />
                    ) : (
                      <div
                        className={styles.bookOptionDot}
                        style={{ backgroundColor: book.coverColor }}
                      />
                    )}
                    <div className={styles.bookOptionText}>
                      <span className={styles.bookOptionTitle}>{book.title}</span>
                      <span className={styles.bookOptionAuthor}>{book.author}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected existing book */}
            {selectedBookId && existingBook && (
              <motion.div
                className={styles.selectedResultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {existingBook.coverImage ? (
                  <img src={existingBook.coverImage} alt="" className={styles.selectedResultCover} />
                ) : (
                  <div
                    className={styles.bookOptionDot}
                    style={{ backgroundColor: existingBook.coverColor }}
                  />
                )}
                <div className={styles.selectedResultInfo}>
                  <span className={styles.selectedResultTitle}>{existingBook.title}</span>
                  <span className={styles.selectedResultAuthor}>{existingBook.author}</span>
                </div>
                <button className={styles.selectedResultChange} onClick={clearSearch}>
                  Change
                </button>
              </motion.div>
            )}

            <button
              className={styles.continueButton}
              onClick={handleBookSubmit}
              disabled={!selectedBookId && !selectedResult && !searchQuery.trim()}
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Key Concept */}
        {step === 'concept' && (
          <motion.div
            key="concept"
            className={styles.stepContainer}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.stepBookContext}>
              {currentBook?.coverImage ? (
                <img src={currentBook.coverImage} alt="" className={styles.stepBookThumb} />
              ) : (
                <div
                  className={styles.bookOptionDot}
                  style={{
                    backgroundColor: currentBook?.coverColor || 'var(--color-accent)',
                  }}
                />
              )}
              <span className={styles.stepBookTitle}>
                {currentBook?.title || searchQuery}
              </span>
            </div>

            <h3 className={styles.stepQuestion}>
              What's the key idea you want to hold onto?
            </h3>

            <textarea
              className={styles.textarea}
              placeholder="The concept, insight, or framework..."
              value={conceptText}
              onChange={(e) => setConceptText(e.target.value)}
              rows={3}
              autoFocus
            />

            {!showMoreFields && (
              <button
                className={styles.addMoreButton}
                onClick={() => setShowMoreFields(true)}
              >
                + Add context or a personal note
              </button>
            )}

            {showMoreFields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  className={styles.textarea}
                  placeholder="Some context — what does this idea mean?"
                  value={conceptContext}
                  onChange={(e) => setConceptContext(e.target.value)}
                  rows={3}
                  autoFocus
                />

                <textarea
                  className={styles.textarea}
                  placeholder="Why does it matter to you?"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={2}
                />
              </motion.div>
            )}

            <button
              className={styles.continueButton}
              onClick={handleConceptSubmit}
              disabled={!conceptText.trim()}
            >
              Save this idea
            </button>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <motion.div
            key="done"
            className={styles.stepContainer}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.doneIcon}>&#10003;</div>
            <h3 className={styles.doneTitle}>Safely kept</h3>
            <p className={styles.doneText}>
              This idea has been added to your library. It will appear in your
              daily practice when it's ready to be revisited.
            </p>

            <div className={styles.doneActions}>
              <button className={styles.addAnotherButton} onClick={handleAddAnother}>
                Add another idea
              </button>
              <button className={styles.finishButton} onClick={handleFinish}>
                View in your library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
