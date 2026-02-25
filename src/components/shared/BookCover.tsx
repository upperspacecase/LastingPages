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
  const fadeAmount = showRetention ? 0.5 + retention * 0.5 : 1;

  const sizes = {
    small: { width: 90, height: 132 },
    medium: { width: 120, height: 176 },
    large: { width: 170, height: 250 },
  };

  const s = sizes[size];
  const hasCover = !!book.coverImage;

  return (
    <motion.button
      onClick={onClick}
      className="book-cover"
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: s.width,
        height: s.height,
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        opacity: fadeAmount,
        transition: 'opacity var(--duration-slow) var(--ease-out)',
        flexShrink: 0,
        border: 'var(--border-bold)',
        textAlign: 'left',
        padding: 0,
        background: hasCover ? 'var(--color-ink)' : `linear-gradient(135deg, ${book.coverColor} 0%, ${book.coverAccent} 100%)`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Cover image background */}
      {hasCover && (
        <img
          src={book.coverImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Spine edge — bold black line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: 'var(--color-ink)',
          zIndex: 3,
        }}
      />

      {/* Bottom title bar — only for books without cover images */}
      {!hasCover && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: 'var(--space-3)',
            paddingLeft: 'calc(var(--space-3) + 3px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fontSize: size === 'small' ? '0.65rem' : size === 'large' ? '0.9rem' : '0.75rem',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.3,
              marginBottom: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}
          >
            {book.title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: size === 'small' ? '0.55rem' : '0.6rem',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
            }}
          >
            {book.author}
          </div>
        </div>
      )}

      {/* Renewal glow when well-retained */}
      {retention > 0.7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          style={{
            position: 'absolute',
            inset: -20,
            background: 'radial-gradient(circle at 50% 80%, var(--color-gold-light), transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
    </motion.button>
  );
}
