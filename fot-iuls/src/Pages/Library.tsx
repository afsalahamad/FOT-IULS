import { useEffect, useMemo, useState } from "react";
import LibraryTabs from "../components/Pages/Home/LibraryTabs";
import { BooksGrid } from "../components/Pages/Home/Books";
import { SearchBar } from "../components/SearchBar/SearchBar";
import type { Scope, SearchFilters, Suggestion } from "../components/SearchBar/types";
import { INITIAL_BOOKS } from "../data/booksData";
import type { BookItem } from "../types/book";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { fetchCatalogBooks, searchCatalogSemantic } from "../lib/catalogService";
import { fetchSavedBookIds, toggleSavedBookInDb } from "../lib/workspaceService";

interface LibraryPageProps {
  profileName?: string;
  onSelectBook?: (bookId: string) => void;
  searchFilterQuery?: string;
  searchScope?: Scope;
  searchLanguage?: string;
  searchYearFrom?: number;
}

export function Library({
  profileName = "Guest",
  onSelectBook,
  searchFilterQuery = "",
  searchScope = "all",
  searchLanguage = "",
  searchYearFrom,
}: LibraryPageProps) {
  const { user, isAuthenticated } = useAuth();
  const hasActiveSearch = Boolean(
    searchFilterQuery.trim() || searchLanguage.trim() || searchYearFrom
  );

  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const searchKey = `${searchFilterQuery}|${searchScope}|${searchLanguage}|${searchYearFrom ?? ""}`;
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  const [activeTab, setActiveTab] = useState<string>(hasActiveSearch ? "All" : "Featured Books");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [savedBookIdsState, setSavedBookIds] = useState<string[]>([]);
  const [semanticState, setSemanticState] = useState<{ key: string; ids: string[] | null }>({
    key: "",
    ids: null,
  });
  const [statusMessage, setStatusMessage] = useState("");

  if (prevSearchKey !== searchKey) {
    setPrevSearchKey(searchKey);
    if (hasActiveSearch) {
      setActiveTab("All");
    }
  }

  const savedBookIds = useMemo(() => (user ? savedBookIdsState : []), [user, savedBookIdsState]);
  const cleanQuery = searchFilterQuery.trim();
  const semanticIds = cleanQuery && semanticState.key === searchKey ? semanticState.ids : null;
  const semanticLoading = Boolean(cleanQuery) && semanticState.key !== searchKey;

  // Load live catalog from Supabase
  useEffect(() => {
    let mounted = true;
    void fetchCatalogBooks().then((loaded) => {
      if (mounted) {
        setBooks(loaded);
        setLoadingCatalog(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync saved books from Supabase for the authenticated user
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void fetchSavedBookIds(user.id)
      .then((ids) => {
        if (mounted) setSavedBookIds(ids);
      })
      .catch(() => {
        if (mounted) setSavedBookIds([]);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  // Run backend semantic search whenever query parameters change
  useEffect(() => {
    if (!cleanQuery) return;
    let cancelled = false;
    void searchCatalogSemantic({
      q: cleanQuery,
      scope: searchScope,
      language: searchLanguage || undefined,
      yearFrom: searchYearFrom,
    }).then((ids) => {
      if (!cancelled) {
        setSemanticState({ key: searchKey, ids });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cleanQuery, searchKey, searchScope, searchLanguage, searchYearFrom]);

  const handleToggleSavedBook = async (bookId: string) => {
    if (!isAuthenticated || !user) {
      setStatusMessage("Sign in to save books to your personal library.");
      window.location.hash = "#login";
      return;
    }
    const currentlySaved = savedBookIds.includes(bookId);
    const optimistic = currentlySaved
      ? savedBookIds.filter((id) => id !== bookId)
      : [...savedBookIds, bookId];
    setSavedBookIds(optimistic);
    setStatusMessage("");

    try {
      await toggleSavedBookInDb(user.id, bookId, currentlySaved);
    } catch (error) {
      setSavedBookIds(savedBookIds);
      setStatusMessage(
        error instanceof Error ? error.message : "Could not update your saved books."
      );
    }
  };

  const handleLibrarySearch = (query: string, scope: Scope, filters?: SearchFilters) => {
    const params = new URLSearchParams({ q: query, scope });
    if (filters?.language) params.set("language", filters.language);
    if (filters?.yearFrom) params.set("year_from", String(filters.yearFrom));
    window.location.hash = `#library?${params}`;
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.group === "Books") {
      if (onSelectBook) onSelectBook(suggestion.id);
      else window.location.hash = `#reading?id=${suggestion.id}`;
    } else if (suggestion.group === "Authors") {
      window.location.hash = `#library?${new URLSearchParams({
        q: suggestion.label,
        scope: "author",
      })}`;
    }
  };

  const handleResetFilters = () => {
    setActiveTab("All");
    setSelectedSubject("All");
    setSemanticState({ key: "", ids: null });
    if (window.location.hash !== "#library") {
      window.location.hash = "#library";
    }
  };

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.subjects.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = searchFilterQuery.trim().toLowerCase();
    const langFilter = searchLanguage.trim().toLowerCase();

    const baseFiltered = books.filter((book: BookItem) => {
      if (activeTab !== "All" && book.category !== activeTab) {
        return false;
      }

      if (selectedSubject !== "All" && !book.subjects.includes(selectedSubject)) {
        return false;
      }

      if (langFilter && book.language.toLowerCase() !== langFilter) {
        return false;
      }

      if (searchYearFrom && book.year < searchYearFrom) {
        return false;
      }

      if (q) {
        // If backend semantic search returned matches, accept semantic matches OR literal local matches
        const inSemantic = semanticIds !== null && semanticIds.includes(book.id);
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesSubject = book.subjects.some((s) => s.toLowerCase().includes(q));
        const matchesAbstract = book.abstract.toLowerCase().includes(q);
        const matchesIsbn = book.isbn.includes(q.replace(/[-\s]/g, ""));

        let matchesLocal = false;
        if (searchScope === "title") matchesLocal = matchesTitle;
        else if (searchScope === "author") matchesLocal = matchesAuthor;
        else if (searchScope === "subject") matchesLocal = matchesSubject;
        else if (searchScope === "isbn") matchesLocal = matchesIsbn;
        else matchesLocal = matchesTitle || matchesAuthor || matchesSubject || matchesAbstract || matchesIsbn;

        if (!inSemantic && !matchesLocal) {
          return false;
        }
      }

      return true;
    });

    // Preserve semantic ranking order when backend semantic search returned IDs
    if (semanticIds && semanticIds.length > 0) {
      const rankMap = new Map(semanticIds.map((id, idx) => [id, idx]));
      return [...baseFiltered].sort((a, b) => {
        const ra = rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const rb = rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return ra - rb;
      });
    }

    return baseFiltered;
  }, [
    books,
    activeTab,
    selectedSubject,
    searchFilterQuery,
    searchScope,
    searchLanguage,
    searchYearFrom,
    semanticIds,
  ]);

  return (
    <div className="home-container">
      <Navigation profileName={profileName} />
      <main id="library">
        <div className="home-section-title-wrap">
          <span className="home-section-badge">Curated Collection</span>
          <h1>University Library Catalog</h1>
          <p>
            Explore core academic curriculum volumes, faculty course reserves, and monographs across computing, engineering, and sciences.
          </p>
        </div>

        <div className="library-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "12px 20px 40px" }}>
          <div style={{ maxWidth: "780px", margin: "0 auto 24px" }}>
            <SearchBar
              placeholder="Search catalog semantically or by title, author, subject, ISBN..."
              onSearch={handleLibrarySearch}
              onSelect={handleSelectSuggestion}
            />
          </div>

          {statusMessage && (
            <p role="alert" style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
              {statusMessage}
            </p>
          )}

          <LibraryTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSelectedSubject("All");
            }}
            onViewAll={() => {
              setActiveTab("All");
              setSelectedSubject("All");
            }}
          />

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "20px 0 10px 0", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", marginRight: "4px" }}>
              Subject:
            </span>
            {allSubjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "16px",
                  border: "1px solid #cbd5e1",
                  background: selectedSubject === subj ? "#00566a" : "#f8fafc",
                  color: selectedSubject === subj ? "#ffffff" : "#475569",
                  fontSize: "12px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {subj}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "14px 0" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              {loadingCatalog
                ? "Loading library catalog..."
                : (
                  <>
                    Showing <strong>{filteredBooks.length}</strong> of {books.length} books
                    {activeTab !== "All" && ` in ${activeTab}`}
                    {selectedSubject !== "All" && ` · Subject: ${selectedSubject}`}
                    {searchFilterQuery.trim() && ` · Query: "${searchFilterQuery}" (${searchScope})`}
                    {searchLanguage && ` · Lang: ${searchLanguage.toUpperCase()}`}
                    {searchYearFrom && ` · From: ${searchYearFrom}+`}
                    {semanticLoading && " · Ranking results..."}
                  </>
                )}
            </p>

            {(activeTab !== "All" || selectedSubject !== "All" || hasActiveSearch) && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00566a",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Reset Filters ↺
              </button>
            )}
          </div>

          {filteredBooks.length > 0 ? (
            <BooksGrid
              books={filteredBooks}
              onSelectBook={onSelectBook}
              savedBookIds={savedBookIds}
              onToggleSave={(id) => void handleToggleSavedBook(id)}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                marginTop: "20px",
              }}
            >
              <h3 style={{ color: "#334155", marginBottom: "8px" }}>No books found</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
                No titles match the selected criteria or search query.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: "8px 18px",
                  background: "#00566a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Show All Books
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Library;
