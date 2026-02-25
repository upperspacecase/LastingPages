import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { BookCover } from '../shared/BookCover';
import { getBookRetention } from '../../utils/retention';
import styles from './Library.module.css';

export function Library() {
  const { books, setView, selectBook } = useStore();

  const needsAttention = books
    .filter((b) => b.concepts.length > 0)
    .sort((a, b) => getBookRetention(a) - getBookRetention(b));

  const recentlyAdded = [...books].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );

  const wellRetained = books
    .filter((b) => getBookRetention(b) > 0.6 && b.concepts.length > 0)
    .sort((a, b) => getBookRetention(b) - getBookRetention(a));

  const totalConcepts = books.reduce((sum, b) => sum + b.concepts.length, 0);

  return (
    <motion.div
      className={styles.library}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Your Library
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {books.length} {books.length === 1 ? 'book' : 'books'} &middot; {totalConcepts}{' '}
            {totalConcepts === 1 ? 'idea' : 'ideas'} captured
          </motion.p>
        </div>
      </div>

      {/* Daily Practice CTA */}
      {totalConcepts > 0 && (
        <motion.button
          className={styles.practiceCard}
          onClick={() => setView('practice')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className={styles.practiceCardInner}>
            <div className={styles.practiceLabel}>Today's Practice</div>
            <div className={styles.practiceDescription}>
              Your ideas are waiting. Whenever you're ready.
            </div>
          </div>
          <div className={styles.practiceArrow}>&rarr;</div>
        </motion.button>
      )}

      {/* Fading — Needs Attention */}
      {needsAttention.length > 0 &&
        needsAttention.some((b) => getBookRetention(b) < 0.5) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Gently fading</h2>
            <p className={styles.sectionHint}>
              These ideas are ready to be remembered again
            </p>
            <div className={`${styles.shelf} scroll-container`}>
              {needsAttention
                .filter((b) => getBookRetention(b) < 0.5)
                .map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                  >
                    <BookCover book={book} onClick={() => selectBook(book.id)} />
                  </motion.div>
                ))}
            </div>
          </section>
        )}

      {/* Full Collection */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your collection</h2>
        <div className={`${styles.shelf} scroll-container`}>
          {recentlyAdded.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <BookCover book={book} onClick={() => selectBook(book.id)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alive & Well */}
      {wellRetained.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alive &amp; well</h2>
          <p className={styles.sectionHint}>Ideas you've been keeping close</p>
          <div className={`${styles.shelf} scroll-container`}>
            {wellRetained.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              >
                <BookCover book={book} onClick={() => selectBook(book.id)} showRetention={false} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {books.length === 0 && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={styles.emptyText}>
            Every great collection starts with a single book.
            <br />
            What's the one that changed your thinking most?
          </p>
          <button className={styles.addButton} onClick={() => setView('capture')}>
            Add your first book
          </button>
        </motion.div>
      )}

      {/* Bottom Nav */}
      <nav className={styles.nav}>
        <button className={`${styles.navButton} ${styles.navActive}`}>
          <span className={styles.navIcon}>&#9776;</span>
          <span className={styles.navLabel}>Library</span>
        </button>
        <button className={styles.navButton} onClick={() => setView('practice')}>
          <span className={styles.navIcon}>&#9673;</span>
          <span className={styles.navLabel}>Practice</span>
        </button>
        <button className={styles.navButton} onClick={() => setView('capture')}>
          <span className={styles.navIcon}>&#43;</span>
          <span className={styles.navLabel}>Capture</span>
        </button>
      </nav>
    </motion.div>
  );
}
