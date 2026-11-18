import "./Boo.css";
import type { BookItem } from "../../../types/book";
import { INITIAL_BOOKS } from "../../../data/booksData";

interface BookCardProps {
  book: BookItem;
  onSelect?: (bookId: string) => void;
}

export function BookCard({ book, onSelect }: BookCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(book.id);
    } else {
      window.location.hash = `#reading?id=${book.id}`;
    }
  };

  return (
    <div
      className="book-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={`Read ${book.title} by ${book.author}`}
    >
      {book.badge && <span className="book-badge">{book.badge}</span>}

      <div className="book-cover-wrap">
        <img
          src={book.coverImage || "/ai.jpg"}
          alt={book.title}
          className="book-image"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = "/ai.jpg";
          }}
        />
      </div>

      <div className="book-card-info">
        <h4>{book.title}</h4>
        <p className="book-author">By {book.author} ({book.year})</p>

        <div className="book-subjects-row">
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
          <button type="button" className="book-read-btn">
            Read Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface BooksGridProps {
  books?: BookItem[];
  onSelectBook?: (bookId: string) => void;
}

export function BooksGrid({ books = INITIAL_BOOKS, onSelectBook }: BooksGridProps) {
  return (
    <div className="books-grid" id="library-books">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onSelectBook} />
      ))}
    </div>
  );
}

// Default export kept for backward compatibility with earlier code
export default function Books({ books = INITIAL_BOOKS, onSelectBook }: BooksGridProps) {
  return <BooksGrid books={books} onSelectBook={onSelectBook} />;
}
