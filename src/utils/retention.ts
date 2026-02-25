import { differenceInDays, differenceInHours } from 'date-fns';
import type { Concept, Book } from '../types';

/**
 * Calculate retention health (0–1) based on forgetting curve.
 * Uses a simplified Ebbinghaus model: retention decays exponentially
 * but each successful revisit extends the stable period.
 */
export function getRetentionHealth(concept: Concept): number {
  if (!concept.lastRevisited) {
    const daysSinceAdded = differenceInDays(new Date(), new Date(concept.dateAdded));
    return Math.max(0, Math.exp(-0.1 * daysSinceAdded));
  }

  const daysSinceRevisit = differenceInDays(new Date(), new Date(concept.lastRevisited));
  // Each revisit extends the "stable" period — more revisits = slower decay
  const stabilityFactor = Math.min(concept.timesRevisited * 0.3, 3);
  const decayRate = 0.08 / (1 + stabilityFactor);

  return Math.max(0, Math.exp(-decayRate * daysSinceRevisit));
}

/**
 * Calculate overall book retention as average of its concepts.
 */
export function getBookRetention(book: Book): number {
  if (book.concepts.length === 0) return 1;
  const total = book.concepts.reduce((sum, c) => sum + getRetentionHealth(c), 0);
  return total / book.concepts.length;
}

/**
 * Select concepts for today's practice, weighted by forgetting curve.
 * Concepts closer to being forgotten are prioritized.
 */
export function selectPracticeConcepts(
  books: Book[],
  count: number = 3
): { concept: Concept; book: Book }[] {
  const allConcepts: { concept: Concept; book: Book; urgency: number }[] = [];

  for (const book of books) {
    for (const concept of book.concepts) {
      const health = getRetentionHealth(concept);
      // Urgency: lower health = higher urgency, but skip very new items
      const hoursSinceAdded = differenceInHours(new Date(), new Date(concept.dateAdded));
      if (hoursSinceAdded < 4) continue;

      const urgency = 1 - health + (Math.random() * 0.2); // slight randomness
      allConcepts.push({ concept, book, urgency });
    }
  }

  // Sort by urgency (most urgent first) and pick top N
  allConcepts.sort((a, b) => b.urgency - a.urgency);
  return allConcepts.slice(0, count).map(({ concept, book }) => ({ concept, book }));
}

/**
 * Generate a practice prompt for a concept.
 */
export function generatePrompt(
  _concept: Concept,
  book: Book
): { type: 'free-recall' | 'connection' | 'interpretation'; prompt: string } {
  const types: ('free-recall' | 'connection' | 'interpretation')[] = [
    'free-recall',
    'connection',
    'interpretation',
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const prompts = {
    'free-recall': [
      `In your own words, what does this idea from "${book.title}" mean to you?`,
      `How would you explain this concept to a friend?`,
      `What's the essence of this idea, as you remember it?`,
    ],
    connection: [
      `How does this idea connect to something in your life this week?`,
      `Where have you seen this concept at work in the world around you?`,
      `If you were writing about this idea today, what story would you tell?`,
    ],
    interpretation: [
      `Which framing best captures what ${book.author} was exploring here?`,
      `Which of these perspectives resonates most with the original idea?`,
      `How would you describe the heart of this concept?`,
    ],
  };

  const options = prompts[type];
  const prompt = options[Math.floor(Math.random() * options.length)];

  return { type, prompt };
}

/**
 * Format retention days into a human-readable string.
 */
export function formatRetentionPeriod(days: number): string {
  if (days === 0) return 'new today';
  if (days === 1) return 'one day';
  if (days < 7) return `${days} days`;
  if (days < 14) return 'about a week';
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 60) return 'about a month';
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `over a year`;
}
