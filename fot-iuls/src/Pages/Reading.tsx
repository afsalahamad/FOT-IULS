import { useState, useEffect } from "react";
import { getBookById, INITIAL_BOOKS } from "../data/booksData";
import { AISummary } from "../components/AISummary/AISummary";
import Footer from "../components/Footer";
import "./Reading.css";

interface ReadingProps {
  bookId?: string;
  onBack?: () => void;
}

export function Reading({ bookId, onBack }: ReadingProps) {
  // Determine book by ID or fallback
  const resolvedId = bookId || (() => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]id=([^&]+)/) || hash.match(/#reading\/([^/?]+)/);
    return match ? match[1] : INITIAL_BOOKS[0].id;
  })();

  const book = getBookById(resolvedId) || INITIAL_BOOKS[0];

  const [prevBookId, setPrevBookId] = useState(book.id);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [theme, setTheme] = useState<"theme-light" | "theme-sepia" | "theme-dark">("theme-light");
  const [fontSize, setFontSize] = useState<number>(17);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Reset chapter if book ID changed
  if (prevBookId !== book.id) {
    setPrevBookId(book.id);
    setActiveChapterIndex(0);
  }

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentChapter = book.chapters[activeChapterIndex] || book.chapters[0];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = "#library";
    }
  };

  return (
    <div className={`reading-page ${theme}`}>
      {/* Scroll Progress Track */}
      <div className="reading-progress-track">
        <div
          className="reading-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky Reader Toolbar */}
      <header className="reading-header-bar">
        <div className="reading-nav-left">
          <button
            type="button"
            className="back-to-library-btn"
            onClick={handleBack}
          >
            ← Back to Library
          </button>
          <div className="reading-header-title" title={`${book.title} - ${currentChapter?.title}`}>
            {book.title}
          </div>
        </div>

        <div className="reading-controls-right">
          {/* Font Controls */}
          <div className="reading-tool-group">
            <button
              type="button"
              className="reading-tool-btn"
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              type="button"
              className="reading-tool-btn"
              onClick={() => setFontSize(17)}
              title="Reset Font Size"
            >
              {fontSize}px
            </button>
            <button
              type="button"
              className="reading-tool-btn"
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Theme Modes */}
          <div className="reading-tool-group">
            <button
              type="button"
              className={`reading-tool-btn ${theme === "theme-light" ? "active" : ""}`}
              onClick={() => setTheme("theme-light")}
              title="Daylight Theme"
            >
              Day
            </button>
            <button
              type="button"
              className={`reading-tool-btn ${theme === "theme-sepia" ? "active" : ""}`}
              onClick={() => setTheme("theme-sepia")}
              title="Warm Sepia Theme"
            >
              Sepia
            </button>
            <button
              type="button"
              className={`reading-tool-btn ${theme === "theme-dark" ? "active" : ""}`}
              onClick={() => setTheme("theme-dark")}
              title="Night Dark Theme"
            >
              Night
            </button>
          </div>
        </div>
      </header>

      {/* Main Reading Workspace */}
      <main className="reading-layout-container">
        {/* Left Side: Book Chapter Content */}
        <section className="reading-reader-pane">
          {/* Book Details Overview Header */}
          <div className="book-overview-hero">
            <img
              src={book.coverImage || "/ai.jpg"}
              alt={book.title}
              className="book-overview-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/ai.jpg";
              }}
            />
            <div className="book-overview-details">
              <h1>{book.title}</h1>
              <div className="book-overview-author">
                By {book.author} · Published {book.year}
              </div>
              <div className="book-overview-meta-row">
                <span className="book-overview-meta-pill">ISBN: {book.isbn}</span>
                <span className="book-overview-meta-pill">Lang: {book.language.toUpperCase()}</span>
                <span className="book-overview-meta-pill">Rating: {book.rating.toFixed(1)} / 5 ({book.reviewsCount} reviews)</span>
              </div>
              <p className="book-overview-abstract">{book.abstract}</p>
            </div>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="reading-chapters-nav" role="tablist" aria-label="Book Chapters">
            {book.chapters.map((chap, idx) => (
              <button
                key={chap.id}
                type="button"
                role="tab"
                aria-selected={activeChapterIndex === idx}
                className={`chapter-nav-btn ${activeChapterIndex === idx ? "active" : ""}`}
                onClick={() => {
                  setActiveChapterIndex(idx);
                  window.scrollTo({ top: 220, behavior: "smooth" });
                }}
              >
                {chap.title}
              </button>
            ))}
          </div>

          {/* Chapter Reading Article */}
          <article
            className="chapter-article"
            style={{ fontSize: `${fontSize}px` }}
          >
            <h2>{currentChapter?.title}</h2>
            {currentChapter?.content.map((paragraph, pIdx) => (
              <p key={pIdx} className="chapter-paragraph">
                {paragraph}
              </p>
            ))}
          </article>

          {/* Bottom Chapter Step Buttons */}
          <div className="chapter-footer-nav">
            <button
              type="button"
              className="chapter-nav-step-btn"
              disabled={activeChapterIndex <= 0}
              onClick={() => {
                setActiveChapterIndex((prev) => Math.max(0, prev - 1));
                window.scrollTo({ top: 220, behavior: "smooth" });
              }}
            >
              ← Previous Chapter
            </button>

            <span style={{ fontSize: "13px", opacity: 0.8 }}>
              Chapter {activeChapterIndex + 1} of {book.chapters.length}
            </span>

            <button
              type="button"
              className="chapter-nav-step-btn"
              disabled={activeChapterIndex >= book.chapters.length - 1}
              onClick={() => {
                setActiveChapterIndex((prev) => Math.min(book.chapters.length - 1, prev + 1));
                window.scrollTo({ top: 220, behavior: "smooth" });
              }}
            >
              Next Chapter →
            </button>
          </div>
        </section>

        {/* Right Side: AI Summary & Study Assistant Pane */}
        <aside className="reading-ai-pane">
          <AISummary
            bookTitle={book.title}
            author={book.author}
            aiData={book.aiSummary}
          />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default Reading;
