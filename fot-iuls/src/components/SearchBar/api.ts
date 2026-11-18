import type { Interpretation, Scope, Suggestion } from "./types";

/**
 * Relative URLs: in development the Vite proxy forwards /api to the Python
 * backend (see vite.config.ts). In production, serve both behind one domain
 * or change this to your API's full URL.
 */
const API_BASE = "/api";

interface SuggestItem {
  id: string;
  title: string;
  author?: string;
}

/** Semantic suggestions while user types. Fast, embeddings only, no LLM. */
export async function fetchSuggestions(
  query: string,
  scope: Scope,
  signal: AbortSignal
): Promise<Suggestion[]> {
  const params = new URLSearchParams({ q: query, scope, limit: "10" });
  const res = await fetch(`${API_BASE}/suggest?${params}`, { signal });
  if (!res.ok) throw new Error(`Suggest failed with status ${res.status}`);
  const data: { items: SuggestItem[] } = await res.json();

  const books: Suggestion[] = [];
  const authors = new Map<string, Suggestion>();

  for (const item of data.items) {
    if (books.length < 6) {
      books.push({
        id: item.id,
        label: item.title,
        meta: item.author,
        group: "Books",
        href: `/catalog/${item.id}`,
      });
    }
    if (item.author && authors.size < 3 && !authors.has(item.author)) {
      authors.set(item.author, {
        id: `author:${item.author}`,
        label: item.author,
        group: "Authors",
        href: `/results?q=${encodeURIComponent(item.author)}&scope=author`,
      });
    }
  }

  return [...books, ...authors.values()];
}

/**
   Asks the backend's language model to turn a plain-language request into a clean query plus filters. 
   Returns null on timeout or failure so the caller can fall back to a normal search. 
   The search bar must never get stuck.
 */
export async function interpretQuery(
  query: string,
  timeoutMs = 4000
): Promise<Interpretation | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/interpret?${new URLSearchParams({ q: query })}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data: Interpretation = await res.json();
    return data.ai ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
