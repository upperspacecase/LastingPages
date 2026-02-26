import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Concept, AppView, OnboardingState, Reflection } from '@/types';
import { sampleBooks } from '@/utils/sampleData';

interface AppState {
  // Navigation
  currentView: AppView;
  selectedBookId: string | null;
  setView: (view: AppView) => void;
  selectBook: (id: string | null) => void;

  // Onboarding
  onboarding: OnboardingState;
  setOnboardingStep: (step: number) => void;
  setOnboardingName: (name: string) => void;
  setOnboardingFavoriteBook: (book: string) => void;
  setOnboardingInterests: (interests: string[]) => void;
  completeOnboarding: () => void;

  // Library
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;

  // Concepts
  addConcept: (bookId: string, concept: Concept) => void;
  updateConcept: (bookId: string, conceptId: string, updates: Partial<Concept>) => void;

  // Practice
  practiceActive: boolean;
  currentCardIndex: number;
  reflections: Reflection[];
  startPractice: () => void;
  endPractice: () => void;
  setCardIndex: (index: number) => void;
  addReflection: (reflection: Reflection) => void;
  markConceptRevisited: (bookId: string, conceptId: string) => void;

  // Seed demo data
  seedDemoData: () => void;

  // Server sync
  hydrated: boolean;
  hydrateFromServer: () => Promise<void>;
}

// Fire-and-forget API helper — doesn't block the UI
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
      // Navigation
      currentView: 'onboarding',
      selectedBookId: null,
      setView: (view) => set({ currentView: view }),
      selectBook: (id) => set({ selectedBookId: id, currentView: id ? 'book-detail' : 'library' }),

      // Onboarding
      onboarding: {
        step: 0,
        name: '',
        favoriteBook: '',
        interests: [],
        completed: false,
      },
      setOnboardingStep: (step) =>
        set((state) => ({ onboarding: { ...state.onboarding, step } })),
      setOnboardingName: (name) =>
        set((state) => ({ onboarding: { ...state.onboarding, name } })),
      setOnboardingFavoriteBook: (book) =>
        set((state) => ({ onboarding: { ...state.onboarding, favoriteBook: book } })),
      setOnboardingInterests: (interests) =>
        set((state) => ({ onboarding: { ...state.onboarding, interests } })),
      completeOnboarding: () => {
        const state = get();
        set({
          onboarding: { ...state.onboarding, completed: true },
          currentView: 'library',
        });
        // Persist profile to MongoDB
        apiCall('/api/profile', {
          method: 'POST',
          body: JSON.stringify({
            name: state.onboarding.name,
            favoriteBook: state.onboarding.favoriteBook,
            interests: state.onboarding.interests,
            onboardingCompleted: true,
          }),
        });
      },

      // Library
      books: [],
      addBook: (book) => {
        set((state) => ({ books: [...state.books, book] }));
        // Persist to MongoDB
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

      // Concepts
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

      // Practice
      practiceActive: false,
      currentCardIndex: 0,
      reflections: [],
      startPractice: () => set({ practiceActive: true, currentCardIndex: 0, reflections: [] }),
      endPractice: () => set({ practiceActive: false, currentCardIndex: 0 }),
      setCardIndex: (index) => set({ currentCardIndex: index }),
      addReflection: (reflection) =>
        set((state) => ({ reflections: [...state.reflections, reflection] })),
      markConceptRevisited: (bookId, conceptId) => {
        const now = new Date().toISOString();
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId
              ? {
                ...b,
                lastRevisited: now,
                concepts: b.concepts.map((c) =>
                  c.id === conceptId
                    ? {
                      ...c,
                      lastRevisited: now,
                      timesRevisited: c.timesRevisited + 1,
                      retentionDays:
                        Math.floor(
                          (new Date().getTime() - new Date(c.dateAdded).getTime()) / 86400000
                        ),
                    }
                    : c
                ),
              }
              : b
          ),
        }));
        // Sync revisit data to MongoDB
        const book = get().books.find((b) => b.id === bookId);
        const concept = book?.concepts.find((c) => c.id === conceptId);
        if (concept) {
          apiCall(`/api/books/${bookId}/concepts`, {
            method: 'PATCH',
            body: JSON.stringify({
              conceptId,
              lastRevisited: concept.lastRevisited,
              timesRevisited: concept.timesRevisited,
              retentionDays: concept.retentionDays,
            }),
          });
        }
        if (book) {
          apiCall(`/api/books/${bookId}`, {
            method: 'PATCH',
            body: JSON.stringify({ lastRevisited: now }),
          });
        }
      },

      // Demo data
      seedDemoData: () => {
        const state = get();
        if (state.books.length === 0) {
          set({ books: sampleBooks });
          // Seed to MongoDB
          apiCall('/api/books/seed', { method: 'POST' });
        }
      },

      // Server hydration
      hydrated: false,
      hydrateFromServer: async () => {
        try {
          const res = await fetch('/api/books');
          if (res.ok) {
            const books = await res.json();
            if (Array.isArray(books) && books.length > 0) {
              set({ books, hydrated: true });
              return;
            }
          }
        } catch (err) {
          console.error('Failed to hydrate from server:', err);
        }
        set({ hydrated: true });
      },
    }),
    {
      name: 'lasting-pages-store',
    }
  )
);
