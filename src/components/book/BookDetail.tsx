import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { getRetentionHealth, getBookRetention, formatRetentionPeriod } from '../../utils/retention';
import styles from './BookDetail.module.css';

export function BookDetail() {
  const { books, selectedBookId, selectBook, addConcept } = useStore();
  const book = books.find((b) => b.id === selectedBookId);
  const [showAddConcept, setShowAddConcept] = useState(false);
  const [newConceptText, setNewConceptText] = useState('');
  const [newConceptContext, setNewConceptContext] = useState('');
  const [newConceptNote, setNewConceptNote] = useState('');

  if (!book) {
    return (
      <div className={styles.notFound}>
        <p>Book not found.</p>
        <button onClick={() => selectBook(null)}>Return to library</button>
      </div>
    );
  }

  const retention = getBookRetention(book);

  const handleAddConcept = () => {
    if (!newConceptText.trim()) return;
    addConcept(book.id, {
      id: `c-${Date.now()}`,
      bookId: book.id,
      text: newConceptText.trim(),
      context: newConceptContext.trim(),
      personalNote: newConceptNote.trim(),
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      timesRevisited: 0,
      retentionDays: 0,
    });
    setNewConceptText('');
    setNewConceptContext('');
    setNewConceptNote('');
    setShowAddConcept(false);
  };

  return (
    <motion.div
      className={styles.detail}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with back button */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => selectBook(null)}>
          &larr; Library
        </button>
      </div>

      {/* Book Hero */}
      <div className={styles.hero}>
        <motion.div
          className={styles.coverWrap}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className={styles.cover}
            style={{
              background: `linear-gradient(135deg, ${book.coverColor} 0%, ${book.coverAccent} 100%)`,
            }}
          >
            <div className={styles.coverSpine} />
            <div className={styles.coverOverlay} />
            <div className={styles.coverText}>
              <h1 className={styles.coverTitle}>{book.title}</h1>
              <p className={styles.coverAuthor}>{book.author}</p>
            </div>
          </div>
        </motion.div>

        {/* Retention Health — organic visualization */}
        <div className={styles.retentionViz}>
          <div className={styles.retentionBar}>
            <motion.div
              className={styles.retentionFill}
              initial={{ width: 0 }}
              animate={{ width: `${retention * 100}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: retention > 0.6
                  ? `linear-gradient(90deg, var(--color-sage), var(--color-sage-light))`
                  : retention > 0.3
                  ? `linear-gradient(90deg, var(--color-gold), var(--color-gold-light))`
                  : `linear-gradient(90deg, var(--color-terracotta-muted), var(--color-terracotta-light))`,
              }}
            />
          </div>
          <p className={styles.retentionLabel}>
            {retention > 0.7
              ? 'These ideas are alive and well'
              : retention > 0.4
              ? 'Some ideas are gently fading'
              : 'These ideas are ready to be remembered again'}
          </p>
        </div>
      </div>

      {/* Personal Notes */}
      {book.notes && (
        <section className={styles.section}>
          <p className={styles.personalNote}>{book.notes}</p>
        </section>
      )}

      {/* Key Concepts */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Key ideas</h2>
          <span className={styles.sectionCount}>{book.concepts.length}</span>
        </div>

        <div className={styles.concepts}>
          {book.concepts.map((concept, i) => {
            const health = getRetentionHealth(concept);
            return (
              <motion.div
                key={concept.id}
                className={styles.conceptCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              >
                <div className={styles.conceptHealth}>
                  <div
                    className={styles.conceptDot}
                    style={{
                      backgroundColor: health > 0.6
                        ? 'var(--color-sage)'
                        : health > 0.3
                        ? 'var(--color-gold)'
                        : 'var(--color-terracotta-muted)',
                      opacity: 0.4 + health * 0.6,
                    }}
                  />
                </div>
                <div className={styles.conceptBody}>
                  <h3 className={styles.conceptTitle}>{concept.text}</h3>
                  <p className={styles.conceptContext}>{concept.context}</p>
                  {concept.personalNote && (
                    <p className={styles.conceptNote}>
                      &ldquo;{concept.personalNote}&rdquo;
                    </p>
                  )}
                  <div className={styles.conceptMeta}>
                    {concept.timesRevisited > 0 ? (
                      <span>
                        Revisited {concept.timesRevisited}{' '}
                        {concept.timesRevisited === 1 ? 'time' : 'times'} &middot; Held for{' '}
                        {formatRetentionPeriod(concept.retentionDays)}
                      </span>
                    ) : (
                      <span>Not yet revisited</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Concept */}
        {!showAddConcept ? (
          <button
            className={styles.addConceptButton}
            onClick={() => setShowAddConcept(true)}
          >
            + Add a key idea
          </button>
        ) : (
          <motion.div
            className={styles.addConceptForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <input
              className={styles.addConceptInput}
              placeholder="The key idea..."
              value={newConceptText}
              onChange={(e) => setNewConceptText(e.target.value)}
              autoFocus
            />
            <textarea
              className={styles.addConceptTextarea}
              placeholder="Context — what does this idea mean?"
              value={newConceptContext}
              onChange={(e) => setNewConceptContext(e.target.value)}
              rows={2}
            />
            <textarea
              className={styles.addConceptTextarea}
              placeholder="Your personal note — why does it matter to you?"
              value={newConceptNote}
              onChange={(e) => setNewConceptNote(e.target.value)}
              rows={2}
            />
            <div className={styles.addConceptActions}>
              <button className={styles.cancelButton} onClick={() => setShowAddConcept(false)}>
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleAddConcept}
                disabled={!newConceptText.trim()}
              >
                Save idea
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
