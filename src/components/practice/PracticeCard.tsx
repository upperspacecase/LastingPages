import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PracticeCard } from '../../types';
import { formatRetentionPeriod } from '../../utils/retention';
import styles from './Practice.module.css';

interface PracticeCardViewProps {
  card: PracticeCard;
  onReflect: (response: string) => void;
  isRenewed: boolean;
}

export function PracticeCardView({ card, onReflect }: PracticeCardViewProps) {
  const [response, setResponse] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (response.trim().length === 0) {
      // Even just viewing counts as a gentle revisit
      onReflect('(viewed)');
      return;
    }
    setSubmitted(true);
    setTimeout(() => onReflect(response), 600);
  };

  return (
    <div className={styles.card}>
      {/* Renewal glow animation */}
      {submitted && (
        <motion.div
          className={styles.renewalGlow}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Book source */}
      <div className={styles.cardSource}>
        <div
          className={styles.cardSourceDot}
          style={{ backgroundColor: card.book.coverColor }}
        />
        <span className={styles.cardSourceTitle}>{card.book.title}</span>
        <span className={styles.cardSourceAuthor}>{card.book.author}</span>
      </div>

      {/* The concept — the protagonist */}
      <motion.h2
        className={styles.cardConcept}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {card.concept.text}
      </motion.h2>

      {/* Context */}
      <motion.p
        className={styles.cardContext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {card.concept.context}
      </motion.p>

      {/* Retention info */}
      {card.concept.timesRevisited > 0 && (
        <motion.div
          className={styles.cardRetention}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          You've held this idea for{' '}
          {formatRetentionPeriod(card.concept.retentionDays)}
        </motion.div>
      )}

      {/* Interaction area */}
      {!showPrompt ? (
        <motion.button
          className={styles.engageButton}
          onClick={() => setShowPrompt(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
        >
          Sit with this idea
        </motion.button>
      ) : (
        <motion.div
          className={styles.reflectionArea}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className={styles.promptText}>{card.prompt}</p>

          {card.promptType !== 'interpretation' ? (
            <>
              <div className={styles.textareaWrapper}>
                <textarea
                  className={styles.reflectionInput}
                  placeholder="What comes to mind..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  autoFocus
                />
                {response.length > 0 && (
                  <motion.div
                    className={styles.inputUnderline}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  {response.trim().length > 0 ? 'Continue' : 'Simply remember'}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.interpretations}>
              {[
                card.concept.context.slice(0, 60) + '...',
                card.concept.personalNote || 'A different way of seeing this...',
                'The intersection of the practical and the philosophical.',
              ].map((interp, i) => (
                <button
                  key={i}
                  className={styles.interpretationButton}
                  onClick={() => {
                    setResponse(interp);
                    setSubmitted(true);
                    setTimeout(() => onReflect(interp), 600);
                  }}
                >
                  {interp}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Renewed badge */}
      {submitted && (
        <motion.div
          className={styles.renewedBadge}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Renewed
        </motion.div>
      )}
    </div>
  );
}
