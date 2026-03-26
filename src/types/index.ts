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

export type AppView = 'library' | 'book-detail' | 'capture';
