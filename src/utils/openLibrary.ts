/**
 * Open Library API integration.
 * Free, no auth required. Provides book search, metadata, and cover images.
 *
 * Docs: https://openlibrary.org/developers/api
 */

export interface OpenLibrarySearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibrarySearchResult[];
}

export interface BookSearchResult {
  olKey: string;
  title: string;
  author: string;
  year?: number;
  isbn?: string;
  coverUrl?: string;
  pageCount?: number;
  subjects?: string[];
}

/**
 * Search for books by title/author query.
 * Returns up to `limit` results.
 */
export async function searchBooks(query: string, limit = 6): Promise<BookSearchResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  const encoded = encodeURIComponent(query.trim());
  const url = `https://openlibrary.org/search.json?q=${encoded}&limit=${limit}&fields=key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data: OpenLibrarySearchResponse = await res.json();

  return data.docs.map((doc) => {
    const isbn = doc.isbn?.[0];
    const coverId = doc.cover_i;

    return {
      olKey: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? 'Unknown Author',
      year: doc.first_publish_year,
      isbn,
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : isbn
          ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
          : undefined,
      pageCount: doc.number_of_pages_median,
      subjects: doc.subject?.slice(0, 5),
    };
  });
}

/**
 * Get a cover URL for a book by ISBN.
 */
export function getCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Get a cover URL by Open Library cover ID.
 */
export function getCoverUrlById(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
