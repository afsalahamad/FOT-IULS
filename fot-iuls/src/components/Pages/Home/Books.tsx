import "./Boo.css";
import type { BookItem } from "../../../types/book";
import { INITIAL_BOOKS } from "../../../data/booksData";
import { BookCover } from "../../BookCover";

interface BookCardProps {
  book: BookItem;
  onSelect?: (bookId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (bookId: string) => void;
}

export function BookCard({ book, onSelect, isSaved = false, onToggleSave }: BookCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(book.id);
    } else {
      window.location.hash = `#reading?id=${book.id}`;
    }
  };

  return (
    <article className="book-card">
      {book.badge && <span className="book-badge">{book.badge}</span>}

      <div className="book-cover-wrap">
        <BookCover
          src={book.coverImage}
          title={book.title}
          author={book.author}
          gradient={book.coverGradient}
          imgClassName="book-image"
        />
      </div>

      <div className="book-card-info">
        <h4>{book.title}</h4>
        <p className="book-author">By {book.author} ({book.year})</p>

        <div className="book-subjects-row">
          {book.pdfUrl && (
            <span
              className="book-subject-pill"
              style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}
            >
              PDF
            </span>
          )}
          {book.subjects.slice(0, 2).map((subject, idx) => (
            <span key={idx} className="book-subject-pill">
              {subject}
            </span>
          ))}
        </div>

        <div className="book-card-footer">
          <div className="book-rating">
            Rating: {book.rating.toFixed(1)} / 5
          </div>
          <button type="button" className="book-read-btn" onClick={handleClick}>
            Read Now
          </button>
          {onToggleSave && (
            <button
              type="button"
              className="book-save-btn"
              aria-pressed={isSaved}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSave(book.id);
              }}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface BooksGridProps {
  books?: BookItem[];
  onSelectBook?: (bookId: string) => void;
  savedBookIds?: string[];
  onToggleSave?: (bookId: string) => void;
}

export function BooksGrid({ books = INITIAL_BOOKS, onSelectBook, savedBookIds = [], onToggleSave }: BooksGridProps) {
  return (
    <div className="books-grid" id="library-books">
      {books.map((book) => <BookCard
        key={book.id}
        book={book}
        onSelect={onSelectBook}
        isSaved={savedBookIds.includes(book.id)}
        onToggleSave={onToggleSave}
      />)}
    </div>
  );
}

// Default export kept for backward compatibility with earlier code
export default function Books({ books = INITIAL_BOOKS, onSelectBook, savedBookIds, onToggleSave }: BooksGridProps) {
  return <BooksGrid books={books} onSelectBook={onSelectBook} savedBookIds={savedBookIds} onToggleSave={onToggleSave} />;
}
