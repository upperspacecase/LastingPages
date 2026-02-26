import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { selectPracticeConcepts, generatePrompt } from '@/utils/retention';
import type { PracticeCard } from '@/types';
import { PracticeCardView } from './PracticeCard';
import { PracticeSummary } from './PracticeSummary';
import styles from './Practice.module.css';

export function Practice() {
  const { books, setView, endPractice, markConceptRevisited, addReflection } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [renewedConcepts, setRenewedConcepts] = useState<string[]>([]);

  const practiceCards: PracticeCard[] = useMemo(() => {
    const selected = selectPracticeConcepts(books, 3);
    return selected.map(({ concept, book }) => {
      const { type, prompt } = generatePrompt(concept, book);
      return { concept, book, promptType: type, prompt };
    });
  }, [books]);

  if (practiceCards.length === 0) {
    return (
      <motion.div
        className={styles.practice}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Your ideas are still settling in</h2>
          <p className={styles.emptyText}>
            Add some books and key concepts to your library, then return here
            when they're ready for revisiting.
          </p>
          <button className={styles.backButton} onClick={() => setView('library')}>
            Return to your library
          </button>
        </div>
      </motion.div>
    );
  }

  const handleReflection = (response: string) => {
    const card = practiceCards[currentIndex];
    const renewed = response.trim().length > 10;

    addReflection({
      conceptId: card.concept.id,
      response,
      timestamp: new Date().toISOString(),
      renewed,
    });

    if (renewed) {
      markConceptRevisited(card.book.id, card.concept.id);
      setRenewedConcepts((prev) => [...prev, card.concept.id]);
    }

    // Move to next or complete
    if (currentIndex < practiceCards.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 400);
    } else {
      setTimeout(() => setCompleted(true), 400);
    }
  };

  const handleClose = () => {
    endPractice();
    setView('library');
  };

  if (completed) {
    return (
      <PracticeSummary
        cards={practiceCards}
        renewedConcepts={renewedConcepts}
        onClose={handleClose}
        onAddMore={() => { setView('capture'); }}
      />
    );
  }

  return (
    <motion.div
      className={styles.practice}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={handleClose}>
          &larr;
        </button>
        <div className={styles.progress}>
          {practiceCards.map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${i === currentIndex ? styles.progressActive : ''} ${i < currentIndex ? styles.progressDone : ''}`}
            />
          ))}
        </div>
        <div className={styles.headerSpacer} />
      </div>

      {/* Preparing message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={styles.cardContainer}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <PracticeCardView
            card={practiceCards[currentIndex]}
            onReflect={handleReflection}
            isRenewed={renewedConcepts.includes(practiceCards[currentIndex].concept.id)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Concept counter */}
      <div className={styles.counter}>
        <span className={styles.counterText}>
          {currentIndex + 1} of {practiceCards.length}
        </span>
      </div>
    </motion.div>
  );
}
