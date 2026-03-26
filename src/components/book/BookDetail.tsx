import { useState } from 'react';
import { useStore } from '@/store/useStore';
import styles from './BookDetail.module.css';

export function BookDetail() {
  const { books, selectedBookId, selectBook, addConcept } = useStore();
  const book = books.find(b => b.id === selectedBookId);
  const [adding, setAdding] = useState(false);
  const [highlightText, setHighlightText] = useState('');
  const [noteText, setNoteText] = useState('');

  if (!book) {
    return (
      <div className={styles.container}>
        <p>Not found.</p>
        <button onClick={() => selectBook(null)}>Back</button>
      </div>
    );
  }

  const handleSave = () => {
    if (!highlightText.trim()) return;
    addConcept(book.id, {
      id: `c-${Date.now()}`,
      bookId: book.id,
      text: highlightText.trim(),
      context: '',
      personalNote: noteText.trim(),
      dateAdded: new Date().toISOString(),
      lastRevisited: null,
      timesRevisited: 0,
      retentionDays: 0,
    });
    setHighlightText('');
    setNoteText('');
    setAdding(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => selectBook(null)}>
          &larr; BACK
        </button>
      </header>

      <div className={styles.bookInfo}>
        {book.coverImage && (
          <img src={book.coverImage} alt="" className={styles.cover} />
        )}
        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>{book.author}</p>
        {book.type && book.type !== 'book' && (
          <span className={styles.type}>{book.type}</span>
        )}
      </div>

      <section className={styles.highlights}>
        <div className={styles.sectionLabel}>
          {book.concepts.length} {book.concepts.length === 1 ? 'HIGHLIGHT' : 'HIGHLIGHTS'}
        </div>

        {book.concepts.length === 0 && !adding && (
          <p className={styles.emptyText}>no highlights yet.</p>
        )}

        {book.concepts.map(concept => (
          <div key={concept.id} className={styles.highlight}>
            <p className={styles.highlightText}>{concept.text}</p>
            {concept.personalNote && (
              <p className={styles.highlightNote}>{concept.personalNote}</p>
            )}
            {concept.context && !concept.personalNote && (
              <p className={styles.highlightNote}>{concept.context}</p>
            )}
          </div>
        ))}

        {!adding ? (
          <button className={styles.addButton} onClick={() => setAdding(true)}>
            + ADD HIGHLIGHT
          </button>
        ) : (
          <div className={styles.addForm}>
            <textarea
              className={styles.input}
              placeholder="the highlight or idea..."
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              rows={3}
              autoFocus
            />
            <textarea
              className={styles.input}
              placeholder="your note (optional)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
            />
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => { setAdding(false); setHighlightText(''); setNoteText(''); }}>
                CANCEL
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!highlightText.trim()}
              >
                SAVE
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
