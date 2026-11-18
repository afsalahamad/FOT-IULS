import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fetchSuggestions, interpretQuery } from "./api";
import { useDebounce } from "./useDebounce";
import type { Scope, SearchBarProps, Suggestion, SuggestionGroup } from "./types";
import "./SearchBar.css";

const RECENT_KEY = "library-search:recent";
const MAX_RECENT = 5;
/** Queries with fewer words than this skip the AI step: they don't need it. */
const AI_MIN_WORDS = 3;

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "isbn", label: "ISBN" },
  { value: "subject", label: "Subject" },
];

const ISBN_PATTERN = /^(\d{9}[\dXx]|\d{13})$/;
const stripIsbn = (q: string) => q.replace(/[-\s]/g, "");
const looksLikeIsbn = (q: string) => ISBN_PATTERN.test(stripIsbn(q));

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode, quota): ignore */
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "i"));
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}

export function SearchBar({
  onSearch,
  onSelect,
  placeholder = "Search books, authors, ISBNs",
  minChars = 2,
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [smart, setSmart] = useState(true);
  const [searching, setSearching] = useState(false);

  const cache = useRef(new Map<string, Suggestion[]>());
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, debounceMs);
  const showRecent = trimmed.length < minChars;

  // A pasted ISBN switches the scope automatically.
  const effectiveScope: Scope = looksLikeIsbn(trimmed) ? "isbn" : scope;

  // Fetch suggestions. Cleanup aborts the previous request, so a slow
  // response can never overwrite a newer one (no race conditions).
  useEffect(() => {
    if (debounced.length < minChars) {
      setItems([]);
      setStatus("idle");
      return;
    }

    const isIsbn = looksLikeIsbn(debounced);
    const fetchScope: Scope = isIsbn ? "isbn" : scope;
    const term = isIsbn ? stripIsbn(debounced) : debounced;
    const key = `${fetchScope}:${term.toLowerCase()}`;

    const cached = cache.current.get(key);
    if (cached) {
      setItems(cached);
      setActive(-1);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    fetchSuggestions(term, fetchScope, controller.signal)
      .then((result) => {
        cache.current.set(key, result);
        setItems(result);
        setActive(-1);
        setStatus("idle");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, [debounced, scope, minChars]);

  // What the listbox shows: recent searches for a short query, otherwise suggestions.
  const options: Suggestion[] = useMemo(() => {
    if (showRecent) {
      return recent.map((term) => ({
        id: `recent:${term}`,
        label: term,
        group: "Recent" as const,
        href: "",
      }));
    }
    return status === "error" ? [] : items;
  }, [showRecent, recent, items, status]);

  // Group options for display while keeping one flat index for the keyboard.
  const sections = useMemo(() => {
    const out: { group: SuggestionGroup; entries: { s: Suggestion; index: number }[] }[] = [];
    options.forEach((s, index) => {
      let section = out.find((x) => x.group === s.group);
      if (!section) {
        section = { group: s.group, entries: [] };
        out.push(section);
      }
      section.entries.push({ s, index });
    });
    return out;
  }, [options]);

  const isLoading = !showRecent && status === "loading";
  const isError = !showRecent && status === "error";
  const isEmpty = !showRecent && status === "idle" && debounced === trimmed && options.length === 0;
  const hasContent = options.length > 0 || isLoading || isError || isEmpty;
  const popupOpen = open && hasContent;

  // Keep the highlighted option visible when arrowing through a long list.
  useEffect(() => {
    if (active >= 0) {
      document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const runSearch = async (term: string) => {
    const clean = term.trim();
    if (!clean || searching) return;

    const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    saveRecent(next);
    setOpen(false);
    setActive(-1);

    // ISBNs are exact: never send them through the AI.
    if (looksLikeIsbn(clean)) {
      onSearch(stripIsbn(clean), "isbn");
      return;
    }

    // Use the AI only when it can help: smart search is on, the user left the
    // scope on "All fields" (an explicit choice is respected), and the request
    // is long enough to be a sentence rather than a keyword.
    const wordCount = clean.split(/\s+/).length;
    if (!smart || scope !== "all" || wordCount < AI_MIN_WORDS) {
      onSearch(clean, scope);
      return;
    }

    setSearching(true);
    const result = await interpretQuery(clean);
    setSearching(false);

    if (result) {
      onSearch(result.query || clean, result.scope, {
        language: result.language ?? undefined,
        yearFrom: result.year_from ?? undefined,
      });
    } else {
      onSearch(clean, "all"); // AI unavailable or too slow: plain search
    }
  };

  const choose = (s: Suggestion) => {
    if (s.group === "Recent") {
      setQuery(s.label);
      void runSearch(s.label);
      return;
    }
    setOpen(false);
    setActive(-1);
    if (onSelect) onSelect(s);
    else window.location.assign(s.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        if (!options.length) return;
        e.preventDefault();
        setOpen(true);
        setActive((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        if (!options.length) return;
        e.preventDefault();
        setOpen(true);
        setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
        break;
      case "Enter":
        // With an option highlighted, Enter picks it. Otherwise the form submits.
        if (popupOpen && active >= 0 && options[active]) {
          e.preventDefault();
          choose(options[active]);
        }
        break;
      case "Escape":
        if (popupOpen) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
        }
        break;
    }
  };

  const liveMessage = searching
    ? "Interpreting your search"
    : !popupOpen
    ? ""
    : isLoading
    ? "Searching"
    : isError
    ? "Suggestions could not be loaded"
    : options.length === 0
    ? "No suggestions"
    : `${options.length} ${showRecent ? "recent searches" : "suggestions"} available. Use up and down arrows to review.`;

  return (
    <div
      className="lsb"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="lsb__box">
        <form
          role="search"
          className="lsb__form"
          aria-busy={searching}
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(query);
          }}
        >
          <label className="lsb__sr" htmlFor={`${listId}-scope`}>
            Search in
          </label>
          <select
            id={`${listId}-scope`}
            className="lsb__scope"
            value={effectiveScope}
            onChange={(e) => setScope(e.target.value as Scope)}
          >
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="lsb__sr" htmlFor={`${listId}-input`}>
            Search the library catalog
          </label>
          <input
            id={`${listId}-input`}
            className="lsb__input"
            type="search"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            inputMode="search"
            enterKeyHint="search"
            placeholder={placeholder}
            aria-expanded={popupOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={popupOpen && active >= 0 ? optionId(active) : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />

          <button type="submit" className="lsb__submit" disabled={searching}>
            {searching ? (
              "Searching…"
            ) : (
              <img src="src/assets/search.png" alt="Search" className="search-ico" />
            )}
          </button>
        </form>

        {popupOpen && (
          <ul id={listId} role="listbox" aria-label="Suggestions" className="lsb__list">
            {sections.map((section) => (
              <li key={section.group} role="presentation" className="lsb__section">
                <span id={`${listId}-g-${section.group}`} className="lsb__heading">
                  {section.group === "Recent" ? "Recent searches" : section.group}
                </span>
                <ul role="group" aria-labelledby={`${listId}-g-${section.group}`}>
                  {section.entries.map(({ s, index }) => (
                    <li
                      key={s.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === active}
                      className="lsb__option"
                      // preventDefault keeps focus in the input, so blur never
                      // closes the list before the click lands.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(s)}
                      onMouseEnter={() => setActive(index)}
                    >
                      <span className="lsb__label">
                        {s.group === "Recent" ? s.label : <Highlight text={s.label} query={trimmed} />}
                      </span>
                      {s.meta && <span className="lsb__meta">{s.meta}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}

            {isLoading && options.length === 0 && (
              <li role="presentation" className="lsb__status">
                Searching the catalog…
              </li>
            )}
            {isError && (
              <li role="presentation" className="lsb__status lsb__status--error">
                Suggestions could not be loaded. Press Enter to search the full catalog.
              </li>
            )}
            {isEmpty && (
              <li role="presentation" className="lsb__status">
                No suggestions. Press Enter to search the full catalog.
              </li>
            )}
          </ul>
        )}
      </div>

      <label className="lsb__smart">
        <input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} />
        <span>Smart search: understands plain-language requests</span>
      </label>

      <div className="lsb__sr" aria-live="polite" role="status">
        {liveMessage}
      </div>
    </div>
  );
}

export default SearchBar;
