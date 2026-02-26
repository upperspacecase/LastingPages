import { motion } from 'framer-motion';
import type { PracticeCard } from '@/types';
import styles from './Practice.module.css';

interface PracticeSummaryProps {
  cards: PracticeCard[];
  renewedConcepts: string[];
  onClose: () => void;
  onAddMore: () => void;
}

export function PracticeSummary({ cards, renewedConcepts, onClose, onAddMore }: PracticeSummaryProps) {
  const uniqueBooks = [...new Set(cards.map((c) => c.book.title))];

  return (
    <motion.div
      className={styles.practice}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.summaryContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className={styles.summaryTitle}>A moment well spent</h2>
        </motion.div>

        <motion.div
          className={styles.summaryBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className={styles.summaryText}>
            Today you revisited ideas from{' '}
            {uniqueBooks.length === 1 ? (
              <strong>{uniqueBooks[0]}</strong>
            ) : (
              <>
                {uniqueBooks.slice(0, -1).map((b, i) => (
                  <span key={b}>
                    <strong>{b}</strong>
                    {i < uniqueBooks.length - 2 ? ', ' : ''}
                  </span>
                ))}
                {' and '}
                <strong>{uniqueBooks[uniqueBooks.length - 1]}</strong>
              </>
            )}
            .
          </p>

          {renewedConcepts.length > 0 && (
            <p className={styles.summaryHighlight}>
              {renewedConcepts.length}{' '}
              {renewedConcepts.length === 1 ? 'idea was' : 'ideas were'} renewed today.
            </p>
          )}
        </motion.div>

        {/* Books visited */}
        <motion.div
          className={styles.summaryBooks}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {cards.map((card) => (
            <div key={card.concept.id} className={styles.summaryBookRow}>
              <div
                className={styles.summaryBookDot}
                style={{ backgroundColor: card.book.coverColor }}
              />
              <div className={styles.summaryBookInfo}>
                <span className={styles.summaryBookTitle}>{card.book.title}</span>
                <span className={styles.summaryConceptTitle}>{card.concept.text}</span>
              </div>
              {renewedConcepts.includes(card.concept.id) && (
                <span className={styles.summaryRenewed}>renewed</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          className={styles.summaryActions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className={styles.summaryPrompt}>
            Is there anything from today's reading you'd like to add?
          </p>
          <button className={styles.summaryAddButton} onClick={onAddMore}>
            Add a new idea
          </button>
          <button className={styles.summaryDoneButton} onClick={onClose}>
            Return to your library
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
