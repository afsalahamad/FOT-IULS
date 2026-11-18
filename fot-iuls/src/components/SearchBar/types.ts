export type Scope = "all" | "title" | "author" | "isbn" | "subject";

export type SuggestionGroup = "Recent" | "Books" | "Authors";

export interface Suggestion {
  id: string;
  label: string;
  /** Secondary text, e.g. the author of a book */
  meta?: string;
  group: SuggestionGroup;
  href: string;
}

/** Extra filters the AI step can pull out of a plain-language request. */
export interface SearchFilters {
  /** Two-letter language code, e.g. "en" */
  language?: string;
  yearFrom?: number;
}

/** What the backend's /api/interpret endpoint returns. */
export interface Interpretation {
  query: string;
  scope: Scope;
  language: string | null;
  year_from: number | null;
  /** false when the backend fell back to the raw query */
  ai: boolean;
}

export interface SearchBarProps {
  /** Called when the user submits a full search (Enter or the Search button) */
  onSearch: (query: string, scope: Scope, filters?: SearchFilters) => void;
  /** Called when the user picks a book or author suggestion. Defaults to navigating to href. */
  onSelect?: (suggestion: Suggestion) => void;
  placeholder?: string;
  /** Characters required before suggestions are fetched */
  minChars?: number;
  debounceMs?: number;
}
