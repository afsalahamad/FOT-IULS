
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "./bulk_books.css";

type Book = {
  title: string;
  author: string;
  category: string;
  rating: number;
  image: string;
  description: string;
};

const categories = [
  "Programming",
  "Artificial Intelligence",
  "Networking",
  "Technology",
  "Data Science",
  "Research",
  "Science",
  "Other"
];

const csvTemplate = [
  "Title,Author,Category,Rating,Image,Description",
  'Clean Code,Robert C. Martin,Programming,4.5,clean-code.jpg,"A programming book about writing clean code"',
  'Deep Learning,Ian Goodfellow,Artificial Intelligence,4.8,deep-learning.jpg,"Introduction to deep learning"',
  'Computer Networks,Andrew S. Tanenbaum,Networking,4.7,networks.jpg,"Computer networking concepts"'
].join("\n");

// Read CSV including quoted values.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let insideQuotes = false;

  text = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (char === "\r" && text[i + 1] === "\n") i++;

      row.push(value.trim());

      if (row.some(item => item !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (insideQuotes) {
    throw new Error("Invalid CSV: unclosed quotation mark.");
  }

  row.push(value.trim());

  if (row.some(item => item !== "")) {
    rows.push(row);
  }

  return rows;
}

function BulkBookUpload() {
  const [books, setBooks] = useState<Book[]>([]);
  const [csvName, setCsvName] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<
    Record<string, string>
  >({});

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preparedBooks, setPreparedBooks] = useState<Book[]>([]);

  const csvInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  // Temporary image preview URLs
  useEffect(() => {
    const urls: Record<string, string> = {};

    images.forEach(file => {
      urls[file.name.trim().toLowerCase()] =
        URL.createObjectURL(file);
    });

    setImageUrls(urls);

    return () => {
      Object.values(urls).forEach(url =>
        URL.revokeObjectURL(url)
      );
    };
  }, [images]);

  // CSV Upload
  const handleCSVUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");
    setPreparedBooks([]);
    setBooks([]);
    setCsvName("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        throw new Error("CSV file contains no books.");
      }

      const headers = rows[0].map(h =>
        h.trim().toLowerCase()
      );

      const required = [
        "title",
        "author",
        "category",
        "rating",
        "image",
        "description"
      ];

      const missing = required.filter(
        h => !headers.includes(h)
      );

      if (missing.length > 0) {
        throw new Error(
          `Missing CSV columns: ${missing.join(", ")}`
        );
      }

      const parsedBooks: Book[] = rows.slice(1).map(
        (row, index) => {
          const get = (column: string) => {
            const position = headers.indexOf(column);
            return row[position]?.trim() ?? "";
          };

          const ratingText = get("rating");
          const rating = Number(ratingText);

          if (
            !get("title") ||
            !get("author") ||
            !get("category") ||
            !get("image") ||
            !get("description") ||
            ratingText === "" ||
            !Number.isFinite(rating) ||
            rating < 0 ||
            rating > 5
          ) {
            throw new Error(
              `Invalid book details at CSV row ${index + 2}.`
            );
          }

          return {
            title: get("title"),
            author: get("author"),
            category: get("category"),
            rating,
            image: get("image"),
            description: get("description")
          };
        }
      );

      setBooks(parsedBooks);
      setCsvName(file.name);
      setMessage(
        `${parsedBooks.length} books loaded successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read CSV file."
      );
    }
  };

  // Multiple Cover Images
  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selected = Array.from(
      event.target.files ?? []
    );

    const valid = selected.filter(file =>
      ["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    );

    setImages(valid);
    setPreparedBooks([]);
    setMessage("");

    if (valid.length !== selected.length) {
      setError("Only JPG, PNG and WebP images are allowed.");
    } else {
      setError("");
    }
  };

  // Download CSV Template
  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], {
      type: "text/csv;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "library-books-template.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const matchedCount = books.filter(book =>
    Boolean(imageUrls[book.image.toLowerCase()])
  ).length;

  // Future database save integration point
  const handleAddBooks = () => {
    setError("");
    setMessage("");

    if (books.length === 0) {
      setError("Please choose a CSV file first.");
      return;
    }

    const missingImages = books.filter(
      book => !imageUrls[book.image.toLowerCase()]
    );

    if (missingImages.length > 0) {
      setError(
        `${missingImages.length} book cover images are missing. Please select matching images.`
      );
      return;
    }

    // Database integration will be added here later.
    // For now, prepare the validated records.
    setPreparedBooks([...books]);

    setMessage(
      `${books.length} books are ready for database upload. Database connection is not added yet.`
    );
  };

  // Clear selected books and images
  const handleClearBooks = () => {
    const confirmed = window.confirm(
      "Clear all selected books and images?"
    );

    if (!confirmed) return;

    setBooks([]);
    setImages([]);
    setCsvName("");
    setPreparedBooks([]);
    setError("");
    setMessage("");

    if (csvInput.current) {
      csvInput.current.value = "";
    }

    if (imageInput.current) {
      imageInput.current.value = "";
    }
  };

  return (
    <section className="book-import">

      {/* Heading */}
      <div className="book-import-header">
        <div className="book-import-heading">
          <span className="book-import-icon">+</span>

          <div>
            <h2>Bulk Book Import</h2>
            <p>
              Add multiple books to your university library
            </p>
          </div>
        </div>

        <span className="book-import-count">
          {books.length} Books Loaded
        </span>
      </div>

      {/* CSV and Image Upload */}
      <div className="book-import-upload-grid">

        <div className="book-import-upload-box">
          <div className="book-import-upload-icon">
            ▤
          </div>

          <h3>Upload Book Details</h3>

          <p>
            Book Title, Author, Category, Rating,
            Image and Description
          </p>

          <input
            ref={csvInput}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCSVUpload}
            hidden
          />

          <button
            type="button"
            className="book-import-choose"
            onClick={() => csvInput.current?.click()}
          >
            Choose CSV File
          </button>

          <button
            type="button"
            className="book-import-template"
            onClick={downloadTemplate}
          >
            Download CSV Template
          </button>

          {csvName && (
            <p className="book-import-file">
              ✓ {csvName}
            </p>
          )}
        </div>

        <div className="book-import-upload-box">
          <div className="book-import-upload-icon">
            ▧
          </div>

          <h3>Upload Book Images</h3>

          <p>
            Select multiple JPG, PNG or WebP covers
          </p>

          <input
            ref={imageInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            hidden
          />

          <button
            type="button"
            className="book-import-choose"
            onClick={() => imageInput.current?.click()}
          >
            Choose Images
          </button>

          <span className="book-import-image-count">
            {images.length} images selected
          </span>
        </div>

      </div>

      {/* Notifications */}
      {error && (
        <div className="book-import-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="book-import-success" role="status">
          {message}
        </div>
      )}

      {/* Book Preview */}
      <div className="book-import-preview">

        <div className="book-import-preview-heading">
          <h3>Book Details Preview</h3>
          <span>{books.length} Books</span>
        </div>

        <div className="book-import-table-scroll">
          <table className="book-import-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book Image</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Description</th>
                <th>Image Status</th>
              </tr>
            </thead>

            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="book-import-empty"
                  >
                    No books selected. Choose a CSV file
                    to preview your books.
                  </td>
                </tr>
              ) : (
                books.map((book, index) => {
                  const cover =
                    imageUrls[book.image.toLowerCase()];

                  return (
                    <tr key={`${book.title}-${index}`}>
                      <td>{index + 1}</td>

                      <td>
                        {cover ? (
                          <img
                            src={cover}
                            alt={`${book.title} cover`}
                            className="book-import-cover"
                          />
                        ) : (
                          <div className="book-import-no-cover">
                            ▤
                          </div>
                        )}
                      </td>

                      <td className="book-import-book-title">
                        {book.title}
                      </td>

                      <td>{book.author}</td>

                      <td>
                        <span className="book-import-category">
                          {book.category}
                        </span>
                      </td>

                      <td>
                        <span className="book-import-rating">
                          ★ {book.rating.toFixed(1)}
                        </span>
                      </td>

                      <td className="book-import-description">
                        {book.description}
                      </td>

                      <td>
                        <span
                          className={
                            cover
                              ? "book-import-matched"
                              : "book-import-missing"
                          }
                        >
                          {cover
                            ? "✓ Matched"
                            : "Missing"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="book-import-summary">
          <span>
            Books: {books.length}
          </span>

          <span>
            Images: {images.length}
          </span>

          <span>
            Matched: {matchedCount}
          </span>

          {preparedBooks.length > 0 && (
            <span>
              Ready: {preparedBooks.length}
            </span>
          )}
        </div>

      </div>

      {/* Action Buttons */}
      <div className="book-import-actions">
        <button
          type="button"
          className="book-import-add"
          onClick={handleAddBooks}
        >
          + Add Books
        </button>

        <button
          type="button"
          className="book-import-clear"
          onClick={handleClearBooks}
        >
          ↻ Clear Books
        </button>
      </div>

      <p className="book-import-note">
        Preview and validation only. Database saving
        will be connected later.
      </p>

    </section>
  );
}

export default BulkBookUpload;
