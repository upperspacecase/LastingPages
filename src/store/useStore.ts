import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Concept, AppView } from '@/types';

interface AppState {
  currentView: AppView;
  selectedBookId: string | null;
  searchQuery: string;
  setView: (view: AppView) => void;
  selectBook: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;

  addConcept: (bookId: string, concept: Concept) => void;
  updateConcept: (bookId: string, conceptId: string, updates: Partial<Concept>) => void;
  removeConcept: (bookId: string, conceptId: string) => void;

  hydrated: boolean;
  hydrateFromServer: () => Promise<void>;
}

async function apiCall(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      console.error(`API ${options?.method || 'GET'} ${url} failed:`, res.status);
    }
    return res;
  } catch (err) {
    console.error(`API ${options?.method || 'GET'} ${url} error:`, err);
    return null;
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'library',
      selectedBookId: null,
      searchQuery: '',
      setView: (view) => set({ currentView: view }),
      selectBook: (id) => set({ selectedBookId: id, currentView: id ? 'book-detail' : 'library' }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      books: [],
      addBook: (book) => {
        set((state) => ({ books: [...state.books, book] }));
        apiCall('/api/books', {
          method: 'POST',
          body: JSON.stringify(book),
        });
      },
      removeBook: (id) => {
        set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
        apiCall(`/api/books/${id}`, { method: 'DELETE' });
      },
      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
        apiCall(`/api/books/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
      },

      addConcept: (bookId, concept) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, concepts: [...b.concepts, concept] } : b
          ),
        }));
        apiCall(`/api/books/${bookId}/concepts`, {
          method: 'POST',
          body: JSON.stringify(concept),
        });
      },
      updateConcept: (bookId, conceptId, updates) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  concepts: b.concepts.map((c) =>
                    c.id === conceptId ? { ...c, ...updates } : c
                  ),
                }
              : b
          ),
        }));
        apiCall(`/api/books/${bookId}/concepts`, {
          method: 'PATCH',
          body: JSON.stringify({ conceptId, ...updates }),
        });
      },
      removeConcept: (bookId, conceptId) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId
              ? { ...b, concepts: b.concepts.filter((c) => c.id !== conceptId) }
              : b
          ),
        }));
        apiCall(`/api/books/${bookId}/concepts`, {
          method: 'DELETE',
          body: JSON.stringify({ conceptId }),
        });
      },

      hydrated: false,
      hydrateFromServer: async () => {
        try {
          const res = await fetch('/api/books');
          if (res.ok) {
            const books = await res.json();
            if (Array.isArray(books)) {
              set({ books, hydrated: true });
              return;
            }
          }
        } catch (err) {
          console.error('Failed to hydrate from server:', err);
        }
        // Server failed — fall back to whatever persist loaded
        set({ hydrated: true });
      },
    }),
    {
      name: 'lasting-pages-store',
    }
  )
);
