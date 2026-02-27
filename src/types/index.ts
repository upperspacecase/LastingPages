export type SourceType = 'book' | 'podcast' | 'article' | 'video' | 'other';

export interface Book {
  id: string;
  title: string;
  author: string;
  type?: SourceType;
  coverColor: string;
  coverAccent: string;
  coverImage?: string;
  dateAdded: string;
  lastRevisited: string | null;
  concepts: Concept[];
  notes: string;
}

export interface Concept {
  id: string;
  bookId: string;
  text: string;
  context: string;
  personalNote: string;
  skill?: string;
  dateAdded: string;
  lastRevisited: string | null;
  timesRevisited: number;
  retentionDays: number;
}

export interface PracticeCard {
  concept: Concept;
  book: Book;
  promptType: 'free-recall' | 'connection' | 'interpretation';
  prompt: string;
  interpretations?: string[];
  correctIndex?: number;
}

export interface PracticeSession {
  date: string;
  cards: PracticeCard[];
  completed: boolean;
  reflections: Reflection[];
}

export interface Reflection {
  conceptId: string;
  response: string;
  timestamp: string;
  renewed: boolean;
}

export type AppView = 'onboarding' | 'library' | 'practice' | 'book-detail' | 'capture';

export interface OnboardingState {
  step: number;
  name: string;
  favoriteBook: string;
  interests: string[];
  completed: boolean;
}
