import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Concept, AppView, OnboardingState, Reflection } from '../types';
import { sampleBooks } from '../utils/sampleData';

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
      completeOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, completed: true },
          currentView: 'library',
        })),

      // Library
      books: [],
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      removeBook: (id) => set((state) => ({ books: state.books.filter((b) => b.id !== id) })),
      updateBook: (id, updates) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      // Concepts
      addConcept: (bookId, concept) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, concepts: [...b.concepts, concept] } : b
          ),
        })),
      updateConcept: (bookId, conceptId, updates) =>
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
        })),

      // Practice
      practiceActive: false,
      currentCardIndex: 0,
      reflections: [],
      startPractice: () => set({ practiceActive: true, currentCardIndex: 0, reflections: [] }),
      endPractice: () => set({ practiceActive: false, currentCardIndex: 0 }),
      setCardIndex: (index) => set({ currentCardIndex: index }),
      addReflection: (reflection) =>
        set((state) => ({ reflections: [...state.reflections, reflection] })),
      markConceptRevisited: (bookId, conceptId) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  lastRevisited: new Date().toISOString(),
                  concepts: b.concepts.map((c) =>
                    c.id === conceptId
                      ? {
                          ...c,
                          lastRevisited: new Date().toISOString(),
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
        })),

      // Demo data
      seedDemoData: () => {
        const state = get();
        if (state.books.length === 0) {
          set({ books: sampleBooks });
        }
      },
    }),
    {
      name: 'lasting-pages-store',
    }
  )
);
