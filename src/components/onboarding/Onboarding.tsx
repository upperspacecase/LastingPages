import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import styles from './Onboarding.module.css';

const INTERESTS = [
  'Psychology', 'Philosophy', 'Science', 'History',
  'Economics', 'Design', 'Technology', 'Literature',
  'Memoir', 'Nature', 'Politics', 'Art',
];

export function Onboarding() {
  const {
    onboarding,
    setOnboardingName,
    setOnboardingFavoriteBook,
    setOnboardingInterests,
    completeOnboarding,
    seedDemoData,
  } = useStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(onboarding.name);
  const [favoriteBook, setFavoriteBook] = useState(onboarding.favoriteBook);
  const [interests, setInterests] = useState<string[]>(onboarding.interests);

  const handleNext = () => {
    if (step === 0) {
      setOnboardingName(name);
      setStep(1);
    } else if (step === 1) {
      setOnboardingFavoriteBook(favoriteBook);
      setStep(2);
    } else if (step === 2) {
      setOnboardingInterests(interests);
      setStep(3);
    }
  };

  const handleComplete = () => {
    seedDemoData();
    completeOnboarding();
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <motion.div
      className={styles.onboarding}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Ambient background warmth */}
      <div className={styles.ambientGlow} />

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.logoArea}>
              <h1 className={styles.logo}>Lasting<br />Pages</h1>
              <p className={styles.tagline}>
                A book retention companion that turns<br />
                reading into lasting wisdom
              </p>
            </div>

            <div className={styles.conversationArea}>
              <p className={styles.conversationText}>
                Every book you've read has changed your thinking in some way.
                Most of those changes slip away quietly. Let's bring them back.
              </p>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>What should we call you?</label>
                <input
                  className={styles.input}
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                className={styles.continueButton}
                onClick={handleNext}
                disabled={!name.trim()}
              >
                Begin
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Favorite Book */}
        {step === 1 && (
          <motion.div
            key="favorite"
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.conversationArea}>
              <p className={styles.greeting}>
                Welcome, {name}.
              </p>
              <p className={styles.conversationText}>
                Think of one book that genuinely changed how you see the world.
                Not just a book you liked — one that rewired something in your thinking.
              </p>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>What was it?</label>
                <input
                  className={styles.input}
                  placeholder="The book that changed your thinking"
                  value={favoriteBook}
                  onChange={(e) => setFavoriteBook(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                className={styles.continueButton}
                onClick={handleNext}
                disabled={!favoriteBook.trim()}
              >
                Continue
              </button>

              <button className={styles.skipButton} onClick={() => { setStep(2); }}>
                I'll think about this later
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <motion.div
            key="interests"
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.conversationArea}>
              <p className={styles.conversationText}>
                What kinds of ideas do you find yourself drawn to? This helps us
                understand which concepts to surface during your daily practice.
              </p>

              <div className={styles.interestsGrid}>
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    className={`${styles.interestChip} ${interests.includes(interest) ? styles.interestSelected : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <button
                className={styles.continueButton}
                onClick={handleNext}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: First Practice Preview */}
        {step === 3 && (
          <motion.div
            key="preview"
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.conversationArea}>
              <p className={styles.conversationText}>
                Here's how it works: each day, you'll spend a few quiet minutes
                revisiting ideas from the books you've read. Not a quiz — a
                contemplation. A way to keep the ideas that matter to you alive.
              </p>

              {/* Preview card */}
              <div className={styles.previewCard}>
                <div className={styles.previewLabel}>A taste of your daily practice</div>
                <h3 className={styles.previewConcept}>System 1 and System 2 Thinking</h3>
                <p className={styles.previewContext}>
                  Our minds operate in two modes: fast, intuitive System 1 and
                  slow, deliberate System 2.
                </p>
                <p className={styles.previewSource}>
                  from <em>Thinking, Fast and Slow</em>
                </p>
              </div>

              <p className={styles.conversationTextSmall}>
                We've prepared a small collection to get you started.
                You can add your own books and ideas at any time.
              </p>

              <button
                className={styles.continueButton}
                onClick={handleComplete}
              >
                Enter your library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
