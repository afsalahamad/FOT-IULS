import { useState, useEffect } from "react";
import { getBookById, INITIAL_BOOKS } from "../data/booksData";
import { fetchBookById } from "../lib/catalogService";
import type { BookItem } from "../types/book";
import { AISummary } from "../components/AISummary/AISummary";
import { BookCover } from "../components/BookCover";
import Footer from "../components/Footer";
import "./Reading.css";

interface ReadingProps {
  bookId?: string;
  onBack?: () => void;
}

export function Reading({ bookId, onBack }: ReadingProps) {
  const resolvedId = bookId || (() => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]id=([^&]+)/) || hash.match(/#reading\/([^/?]+)/);
    return match ? decodeURIComponent(match[1]) : INITIAL_BOOKS[0].id;
  })();

  const [prevResolvedId, setPrevResolvedId] = useState(resolvedId);
  const [book, setBook] = useState<BookItem>(
    () => getBookById(resolvedId) || INITIAL_BOOKS[0]
  );
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"text" | "pdf">("text");
  const [theme, setTheme] = useState<"theme-light" | "theme-sepia" | "theme-dark">("theme-light");
  const [fontSize, setFontSize] = useState<number>(17);
  const [scrollProgress, setScrollProgress] = useState(0);

  if (prevResolvedId !== resolvedId) {
    setPrevResolvedId(resolvedId);
    setActiveChapterIndex(0);
    setViewMode("text");
    const localMatch = getBookById(resolvedId);
    if (localMatch) {
      setBook(localMatch);
    }
  }

  // Load book from Supabase (supporting newly created Admin books too)
  useEffect(() => {
    let active = true;
    void fetchBookById(resolvedId).then((loaded) => {
      if (active && loaded) {
        setBook(loaded);
      }
    });

    return () => {
      active = false;
    };
  }, [resolvedId]);

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
  const chapterText = currentChapter ? currentChapter.content.join("\n\n") : "";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = "#library";
    }
  };

  return (
    <div className={`reading-page ${theme}`}>
      <div className="reading-progress-track">
        <div
          className="reading-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

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
          {book.pdfUrl && (
            <div className="reading-tool-group">
              <button
                type="button"
                className={`reading-tool-btn ${viewMode === "text" ? "active" : ""}`}
                onClick={() => setViewMode("text")}
                title="Structured Chapter Text Mode"
              >
                Text Mode
              </button>
              <button
                type="button"
                className={`reading-tool-btn ${viewMode === "pdf" ? "active" : ""}`}
                onClick={() => setViewMode("pdf")}
                title="Original PDF Document Viewer"
              >
                PDF Viewer
              </button>
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="reading-tool-btn"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                title="Open or download full PDF"
              >
                Download PDF
              </a>
            </div>
          )}

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

      <main className="reading-layout-container">
        <section className="reading-reader-pane">
          <div className="book-overview-hero">
            <div className="book-overview-cover-wrap">
              <BookCover
                src={book.coverImage}
                title={book.title}
                author={book.author}
                gradient={book.coverGradient}
                imgClassName="book-overview-cover"
                className="book-overview-cover"
              />
            </div>
            <div className="book-overview-details">
              <h1>{book.title}</h1>
              <div className="book-overview-author">
                By {book.author} · Published {book.year}
              </div>
              <div className="book-overview-meta-row">
                {book.isbn && <span className="book-overview-meta-pill">ISBN: {book.isbn}</span>}
                <span className="book-overview-meta-pill">Lang: {book.language.toUpperCase()}</span>
                <span className="book-overview-meta-pill">
                  Rating: {book.rating.toFixed(1)} / 5 ({book.reviewsCount} reviews)
                </span>
              </div>
              <p className="book-overview-abstract">{book.abstract}</p>
            </div>
          </div>

          {viewMode === "pdf" && book.pdfUrl ? (
            <div className="reading-pdf-frame">
              <iframe
                src={`${book.pdfUrl}#view=FitH`}
                title={`${book.title} PDF Viewer`}
              />
            </div>
          ) : (
            <>
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

              <article className="chapter-article" style={{ fontSize: `${fontSize}px` }}>
                <h2>{currentChapter?.title}</h2>
                {currentChapter?.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="chapter-paragraph">
                    {paragraph}
                  </p>
                ))}
              </article>

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
            </>
          )}
        </section>

        <aside className="reading-ai-pane">
          <AISummary
            key={book.id}
            bookId={book.id}
            bookTitle={book.title}
            author={book.author}
            abstract={book.abstract}
            chapterTitle={currentChapter?.title || ""}
            chapterText={chapterText}
            aiData={book.aiSummary}
          />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default Reading;
