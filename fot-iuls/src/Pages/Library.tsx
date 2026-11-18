import { useState, useMemo } from "react";
import LibraryTabs from "../components/Pages/Home/LibraryTabs";
import { BooksGrid } from "../components/Pages/Home/Books";
import { INITIAL_BOOKS } from "../data/booksData";
import type { BookItem } from "../types/book";

interface LibraryPageProps {
  onSelectBook?: (bookId: string) => void;
  searchFilterQuery?: string;
}

export function Library({ onSelectBook, searchFilterQuery = "" }: LibraryPageProps) {
  const [activeTab, setActiveTab] = useState<string>("Featured Books");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Extract all unique subjects
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    INITIAL_BOOKS.forEach((b) => b.subjects.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredBooks = useMemo(() => {
    return INITIAL_BOOKS.filter((book: BookItem) => {
      // Tab filter
      if (activeTab !== "All" && book.category !== activeTab) {
        return false;
      }

      // Subject filter
      if (selectedSubject !== "All" && !book.subjects.includes(selectedSubject)) {
        return false;
      }

      // Query filter
      if (searchFilterQuery.trim()) {
        const q = searchFilterQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesSubject = book.subjects.some((s) => s.toLowerCase().includes(q));
        const matchesIsbn = book.isbn.includes(q.replace(/[-\s]/g, ""));
        if (!matchesTitle && !matchesAuthor && !matchesSubject && !matchesIsbn) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, selectedSubject, searchFilterQuery]);

  return (
    <div className="library-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Library Tabs */}
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

      {/* Subject Filter Pills */}
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
              transition: "all 0.15s"
            }}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Catalog Status Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
          Showing <strong>{filteredBooks.length}</strong> of {INITIAL_BOOKS.length} books
          {activeTab !== "All" && ` in ${activeTab}`}
          {selectedSubject !== "All" && ` · Subject: ${selectedSubject}`}
        </p>

        {(activeTab !== "All" || selectedSubject !== "All" || searchFilterQuery) && (
          <button
            type="button"
            onClick={() => {
              setActiveTab("All");
              setSelectedSubject("All");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#00566a",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600
            }}
          >
            Reset Filters ↺
          </button>
        )}
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <BooksGrid books={filteredBooks} onSelectBook={onSelectBook} />
      ) : (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "1px dashed #cbd5e1",
          marginTop: "20px"
        }}>
          <h3 style={{ color: "#334155", marginBottom: "8px" }}>No books found</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
            No titles match the selected criteria or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("All");
              setSelectedSubject("All");
            }}
            style={{
              padding: "8px 18px",
              background: "#00566a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Show All Books
          </button>
        </div>
      )}
    </div>
  );
}

export default Library;
