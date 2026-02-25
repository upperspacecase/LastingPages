import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Book, Concept } from '../../types';
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
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [conceptText, setConceptText] = useState('');
  const [conceptContext, setConceptContext] = useState('');
  const [personalNote, setPersonalNote] = useState('');

  const existingBook = selectedBookId ? books.find((b) => b.id === selectedBookId) : null;

  const handleBookSubmit = () => {
    if (selectedBookId) {
      setStep('concept');
      return;
    }
    if (!bookTitle.trim()) return;

    const colors = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
    const id = `b-${Date.now()}`;
    const newBook: Book = {
      id,
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
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
    setStep('concept');
  };

  const handleFinish = () => {
    if (selectedBookId) {
      selectBook(selectedBookId);
    } else {
      setView('library');
    }
  };

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

            {/* Existing books */}
            {books.length > 0 && (
              <div className={styles.existingBooks}>
                {books.map((book) => (
                  <button
                    key={book.id}
                    className={`${styles.bookOption} ${selectedBookId === book.id ? styles.bookOptionSelected : ''}`}
                    onClick={() => {
                      setSelectedBookId(selectedBookId === book.id ? null : book.id);
                      setBookTitle('');
                      setBookAuthor('');
                    }}
                  >
                    <div
                      className={styles.bookOptionDot}
                      style={{ backgroundColor: book.coverColor }}
                    />
                    <div className={styles.bookOptionText}>
                      <span className={styles.bookOptionTitle}>{book.title}</span>
                      <span className={styles.bookOptionAuthor}>{book.author}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Or add new */}
            {!selectedBookId && (
              <div className={styles.newBookForm}>
                <p className={styles.orDivider}>
                  {books.length > 0 ? 'or add a new book' : 'Add your book'}
                </p>
                <input
                  className={styles.input}
                  placeholder="Book title"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  autoFocus={books.length === 0}
                />
                <input
                  className={styles.input}
                  placeholder="Author"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                />
              </div>
            )}

            <button
              className={styles.continueButton}
              onClick={handleBookSubmit}
              disabled={!selectedBookId && !bookTitle.trim()}
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
              <div
                className={styles.bookOptionDot}
                style={{
                  backgroundColor: existingBook?.coverColor || books.find((b) => b.id === selectedBookId)?.coverColor || 'var(--color-accent)',
                }}
              />
              <span className={styles.stepBookTitle}>
                {existingBook?.title || bookTitle}
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
              rows={2}
              autoFocus
            />

            <textarea
              className={styles.textarea}
              placeholder="Some context — what does this idea mean? (optional)"
              value={conceptContext}
              onChange={(e) => setConceptContext(e.target.value)}
              rows={3}
            />

            <textarea
              className={styles.textarea}
              placeholder="Why does it matter to you? (optional)"
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              rows={2}
            />

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
