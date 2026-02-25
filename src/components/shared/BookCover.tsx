import { motion } from 'framer-motion';
import type { Book } from '../../types';
import { getBookRetention } from '../../utils/retention';

interface BookCoverProps {
  book: Book;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  showRetention?: boolean;
}

export function BookCover({ book, size = 'medium', onClick, showRetention = true }: BookCoverProps) {
  const retention = getBookRetention(book);
  const fadeAmount = showRetention ? 1 - (1 - retention) * 0.6 : 1;

  const sizes = {
    small: { width: 80, height: 120, titleSize: '0.7rem', authorSize: '0.6rem' },
    medium: { width: 110, height: 165, titleSize: '0.8rem', authorSize: '0.65rem' },
    large: { width: 160, height: 240, titleSize: '1rem', authorSize: '0.8rem' },
  };

  const s = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      className="book-cover"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: s.width,
        height: s.height,
        background: `linear-gradient(135deg, ${book.coverColor} 0%, ${book.coverAccent} 100%)`,
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'var(--space-3)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        opacity: fadeAmount,
        transition: `opacity var(--duration-slow) var(--ease-out)`,
        flexShrink: 0,
        border: 'none',
        textAlign: 'left',
      }}
    >
      {/* Spine edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: 'rgba(0,0,0,0.15)',
        }}
      />

      {/* Paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title and author */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            fontSize: s.titleSize,
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.3,
            marginBottom: 'var(--space-1)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: s.authorSize,
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 300,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {book.author}
        </div>
      </div>

      {/* Renewal glow when well-retained */}
      {retention > 0.7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle at 50% 80%, var(--color-gold-light), transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  );
}
