import logo from '../assets/logo.png';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './Admin.css';
import booksIcon from '../assets/books-icon.png';
import chaptersIcon from '../assets/chapters-icon.png';
import usersIcon from '../assets/users-icon.png';
import notesIcon from '../assets/notes-icon.png';
import editIcon from '../assets/edit-icon.png';
import deleteIcon from '../assets/delete-icon.png';
import viewIcon from '../assets/view-icon.png';
<<<<<<< HEAD
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import type { BookItem, Chapter } from '../types/book';
import { useAuth, type AppRole, type UserProfile } from '../context/useAuth';
import {
    deleteCatalogBook,
    fetchCatalogBooks,
    parseCatalogPdf,
    upsertCatalogBook,
} from '../lib/catalogService';
import {
    downloadResearchPaperFile,
    fetchAdminOverviewStats,
    fetchAllProfiles,
    fetchAllSubmittedPapers,
    reviewResearchPaper,
    updateProfileRole,
    type AdminOverviewStats,
    type PaperStatus,
    type ResearchPaper,
} from '../lib/workspaceService';
=======
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8


interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    rating: number;
    image: string;
    description: string;
}

const initialBooks: Book[] = [
    {
        id: 1,
        title: 'Artificial Intelligence',
        author: 'Stuart Russell',
        category: 'Technology',
        rating: 4.8,
        image: '/images/ai.jfif',
        description: 'An introduction to artificial intelligence.'
    },
    {
        id: 2,
        title: 'Sustainable Cities',
        author: 'Vanessa Hall',
        category: 'Environment',
        rating: 4.7,
        image: '',
        description: 'A study of sustainable cities.'
    },
    {
        id: 3,
        title: 'Data Science for Research',
        author: 'Mark Thompson',
        category: 'Data Science',
        rating: 4.6,
        image: '',
        description: 'Learn data science for research.'
    },
    {
        id: 4,
        title: 'Deep Learning Basics',
        author: 'Ian Goodfellow',
        category: 'AI',
        rating: 4.9,
        image: '',
        description: 'Learn the fundamentals of deep learning.'
    },
    {
        id: 5,
        title: 'Computer Networks',
        author: 'Andrew S. Tanenbaum',
        category: 'Networking',
        rating: 4.7,
        image: '',
        description: 'Introduction to computer networking.'
    }
];

const categories = [
    'Technology',
    'Environment',
    'Data Science',
    'AI',
    'Networking'
];

function Admin() {
    const [books, setBooks] = useState<Book[]>(initialBooks);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [rating, setRating] = useState('4.5');
<<<<<<< HEAD
    const [imagePreview, setImagePreview] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [parsedChapters, setParsedChapters] = useState<Chapter[] | null>(null);
    const [parsingPdf, setParsingPdf] = useState(false);
    const [pdfInfoText, setPdfInfoText] = useState('');
=======
    const [image, setImage] = useState('');
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8
    const [description, setDescription] = useState('');

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result as string);
        };

        reader.readAsDataURL(file);
    }

    async function handlePdfUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
            setErrorMessage('Please select a valid PDF file (.pdf).');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setErrorMessage('Book PDF must be 50 MB or smaller.');
            return;
        }

        setPdfFile(file);
        setParsedChapters(null);
        setParsingPdf(true);
        setErrorMessage('');
        setPdfInfoText(`Selected ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) — extracting chapters...`);

        const parsed = await parseCatalogPdf(file);
        setParsingPdf(false);

        if (parsed) {
            setParsedChapters(parsed.chapters);
            if (!title.trim() && parsed.title) setTitle(parsed.title);
            if (!author.trim() && parsed.author) setAuthor(parsed.author);
            if (!description.trim() && parsed.abstract) setDescription(parsed.abstract);
            setPdfInfoText(
                `${file.name} · ${parsed.pages} pages · ${parsed.chapters.length} chapters extracted automatically.`
            );
        } else {
            setPdfInfoText(
                `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) ready to upload (start FastAPI backend to auto-extract chapters).`
            );
        }
    }

    function clearForm() {
        setTitle('');
        setAuthor('');
<<<<<<< HEAD
        setYear(DEFAULT_YEAR);
        setLanguage('en');
        setIsbn('');
        setSubjectsInput('');
        setCategory('Featured Books');
        setBadge('');
        setRating('4.5');
        setImagePreview('');
        setCoverFile(null);
        setPdfFile(null);
        setParsedChapters(null);
        setPdfInfoText('');
=======
        setCategory('');
        setRating('4.5');
        setImage('');
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8
        setDescription('');
        setEditId(null);
        const pdfInput = document.getElementById('book-pdf') as HTMLInputElement | null;
        if (pdfInput) pdfInput.value = '';
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const bookData: Book = {
            id: editId ?? Date.now(),
            title,
            author,
            category,
            rating: Number(rating),
            image,
            description
        };

<<<<<<< HEAD
            const saved = await upsertCatalogBook(
                {
                    id: editId ?? undefined,
                    title,
                    author,
                    year: Number.parseInt(year, 10) || new Date().getFullYear(),
                    language,
                    isbn,
                    subjects: subjects.length ? subjects : [category.toLowerCase()],
                    abstract: description,
                    rating: Number(rating),
                    category,
                    badge: (badge || undefined) as BookItem['badge'],
                    coverImage: existing?.coverImage || '/ai.jpg',
                    coverFile,
                    pdfUrl: existing?.pdfUrl,
                    pdfPath: existing?.pdfPath,
                    pdfFile,
                    chapters: parsedChapters ?? existing?.chapters,
                    aiSummary: existing?.aiSummary,
                },
                user?.id
            );
=======
        if (editId !== null) {
            setBooks(books.map(book =>
                book.id === editId ? bookData : book
            ));
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8

            alert('Book updated successfully!');
        } else {
            setBooks([...books, bookData]);
            alert('Book added successfully!');
        }

        clearForm();
    }

    function handleEdit(book: Book) {
        setTitle(book.title);
        setAuthor(book.author);
        setCategory(book.category);
        setRating(String(book.rating));
<<<<<<< HEAD
        setImagePreview(book.coverImage || '');
        setCoverFile(null);
        setPdfFile(null);
        setParsedChapters(null);
        setPdfInfoText(book.pdfUrl ? 'Existing PDF attached (select a new file to replace).' : '');
        setDescription(book.abstract);
=======
        setImage(book.image);
        setDescription(book.description);
        setEditId(book.id);
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8

        document.querySelector('.add-book-card')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

<<<<<<< HEAD
    async function handleDelete(book: BookItem) {
        if (!window.confirm(`Are you sure you want to permanently delete "${book.title}" from the catalog?`)) {
            return;
        }
        try {
            await deleteCatalogBook(book.id, book.pdfPath);
            setBooks(prev => prev.filter(item => item.id !== book.id));
            if (editId === book.id) clearForm();
            if (selectedBook?.id === book.id) setSelectedBook(null);
            setStatusMessage('Book deleted from catalog.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not delete book.');
        }
    }
=======
    function handleDelete(id: number) {
        if (window.confirm('Are you sure you want to delete this book?')) {
            setBooks(books.filter(book => book.id !== id));
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8

            if (editId === id) {
                clearForm();
            }

            if (selectedBook?.id === id) {
                setSelectedBook(null);
            }
        }
    }

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            filter === 'All' || book.category === filter;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="admin-page">

            {/* HEADER */}
            <header className="admin-header">
                <div className="admin-brand">
                    <span className="header-symbol">▤</span>
                    <h2>Administration <span>/</span> Book Management</h2>
                </div>

                <div className="admin-user">
                    <span className="admin-avatar">●</span>
                    <strong>Admin</strong>
                    <span className="admin-chevron">⌄</span>
                </div>
            </header>

            {/* WELCOME BANNER */}
            <section className="welcome-banner">
                <div className="welcome-content">
                    <div className="welcome-logo">
                             <img src={logo} alt="IULS Logo" />
                    </div>

                    <div className="welcome-divider"></div>

                    <div className="welcome-text">
                        <h1>Welcome, Admin!</h1>
                        <p>Manage books, chapters and users from here.</p>
                    </div>
                </div>

                <div className="admin-date">
                    <span>▣</span> November 18, 2026
                </div>
            </section>

            
{/* STATISTICS */}
<section className="admin-stats">

    <div className="stat-card">
        <div className="stat-icon">
            <img src={booksIcon} alt="Books" />
        </div>
        <div className="stat-info">
            <p>Total Books</p>
            <h2>{books.length}</h2>
        </div>
    </div>

    <div className="stat-card">
        <div className="stat-icon">
            <img src={chaptersIcon} alt="Chapters" />
        </div>
        <div className="stat-info">
            <p>Total Chapters</p>
            <h2>156</h2>
        </div>
    </div>

    <div className="stat-card">
        <div className="stat-icon">
            <img src={usersIcon} alt="Users" />
        </div>
        <div className="stat-info">
            <p>Registered Users</p>
            <h2>1,250</h2>
        </div>
    </div>

    <div className="stat-card">
        <div className="stat-icon">
            <img src={notesIcon} alt="Notes" />
        </div>
        <div className="stat-info">
            <p>Total Notes</p>
            <h2>8,430</h2>
        </div>
    </div>

</section>
         
            {/* BOOK MANAGEMENT */}
            <section className="book-management">

                {/* ADD / EDIT BOOK */}
                <div className="add-book-card">
                    <h2 className="card-heading">
                        <span className="heading-icon">+</span>
                        {editId !== null ? 'Edit Book' : 'Add New Book'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="admin-title">
                            Book Title <span className="required">*</span>
                        </label>
                        <input
                            id="admin-title"
                            type="text"
                            placeholder="Enter book title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />

                        <label htmlFor="admin-author">
                            Author <span className="required">*</span>
                        </label>
                        <input
                            id="admin-author"
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            required
                        />

                        <label htmlFor="admin-category">Category</label>
                        <select
                            id="admin-category"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>

                        <label htmlFor="admin-rating">Book Rating</label>
                        <input
                            id="admin-rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={rating}
                            onChange={e => setRating(e.target.value)}
                            required
                        />

                        <label>Book Image</label>
                        <div className="image-upload">
                            <input
                                type="file"
                                accept="image/*"
                                id="book-image"
                                onChange={handleImageUpload}
                            />

                            <label htmlFor="book-image" className="upload-label">
                                {image ? (
                                    <img
                                        src={image}
                                        alt="Book preview"
                                        className="upload-preview"
                                    />
                                ) : (
                                    <>
                                        <span className="upload-icon">☁</span>
                                        <strong>Click to upload image</strong>
                                        <small>(JPG, PNG, GIF)</small>
                                    </>
                                )}
                            </label>
                        </div>

                        <label htmlFor="admin-description">Description</label>
                        <textarea
                            id="admin-description"
                            placeholder="Enter book description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />

                        <div className="form-buttons">
                            <button type="submit" className="add-book-btn">
                                + {editId !== null ? 'Update Book' : 'Add Book'}
                            </button>

                            <button
                                type="button"
                                className="reset-btn"
                                onClick={clearForm}
                            >
                                ↻ Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* BOOK LIST */}
                <div className="book-list-card">
                    <div className="book-list-header">
                        <h2 className="card-heading">
                            <span className="heading-icon">▣</span>
                            Book List
                        </h2>

                        <div className="book-tools">
                            <input
                                type="search"
                                placeholder="Search books..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                aria-label="Search books"
                            />

                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="filter-select"
                                aria-label="Filter by category"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
<<<<<<< HEAD

                            <label htmlFor="admin-subjects">Subjects (comma-separated)</label>
                            <input
                                id="admin-subjects"
                                type="text"
                                placeholder="e.g. algorithms, artificial intelligence, systems"
                                value={subjectsInput}
                                onChange={e => setSubjectsInput(e.target.value)}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label htmlFor="admin-year">Year</label>
                                    <input
                                        id="admin-year"
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="admin-lang">Language (ISO)</label>
                                    <input
                                        id="admin-lang"
                                        type="text"
                                        maxLength={5}
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label htmlFor="admin-isbn">ISBN</label>
                                    <input
                                        id="admin-isbn"
                                        type="text"
                                        placeholder="978..."
                                        value={isbn}
                                        onChange={e => setIsbn(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="admin-rating">Book Rating</label>
                                    <input
                                        id="admin-rating"
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={rating}
                                        onChange={e => setRating(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <label htmlFor="admin-badge">Badge (optional)</label>
                            <select
                                id="admin-badge"
                                value={badge}
                                onChange={e => setBadge(e.target.value)}
                            >
                                <option value="">None</option>
                                {BADGES.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>

                            <label>Book Cover Image</label>
                            <div className="image-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="book-image"
                                    onChange={handleImageUpload}
                                />

                                <label htmlFor="book-image" className="upload-label">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Book preview"
                                            className="upload-preview"
                                        />
                                    ) : (
                                        <>
                                            <span className="upload-icon">☁</span>
                                            <strong>Click to upload cover</strong>
                                            <small>(JPG, PNG, WEBP · max 5 MB)</small>
                                        </>
                                    )}
                                </label>
                            </div>

                            <label htmlFor="book-pdf">Book PDF File (optional · max 50 MB)</label>
                            <input
                                id="book-pdf"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => void handlePdfUpload(e)}
                                disabled={parsingPdf || savingBook}
                            />
                            {pdfInfoText && (
                                <small style={{ display: 'block', marginTop: '4px', marginBottom: '10px', color: '#0369a1' }}>
                                    {pdfInfoText}
                                </small>
                            )}

                            <label htmlFor="admin-description">Abstract / Description</label>
                            <textarea
                                id="admin-description"
                                placeholder="Enter book abstract..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                            />

                            <div className="form-buttons">
                                <button type="submit" className="add-book-btn" disabled={savingBook}>
                                    {savingBook
                                        ? 'Saving...'
                                        : editId !== null
                                        ? 'Update Book'
                                        : '+ Add Book'}
                                </button>

                                <button
                                    type="button"
                                    className="reset-btn"
                                    onClick={clearForm}
                                    disabled={savingBook}
                                >
                                    ↻ Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="book-list-card">
                        <div className="book-list-header">
                            <h2 className="card-heading">
                                <span className="heading-icon">▣</span>
                                Unified Library Catalog
                            </h2>

                            <div className="book-tools">
                                <input
                                    type="search"
                                    placeholder="Search books..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    aria-label="Search books"
                                />

                                <select
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    className="filter-select"
                                    aria-label="Filter by category"
                                >
                                    <option value="All">All Categories</option>
                                    {CATEGORIES.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="book-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Cover</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Category</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredBooks.map((book, index) => (
                                        <tr key={book.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {book.coverImage ? (
                                                    <img
                                                        src={book.coverImage}
                                                        alt={book.title}
                                                        className="table-book-image"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/ai.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="no-image">▣</div>
                                                )}
                                            </td>
                                            <td className="book-title-cell">
                                                {book.title}
                                                {book.pdfUrl && (
                                                    <span
                                                        style={{
                                                            marginLeft: '6px',
                                                            fontSize: '11px',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            background: '#dbeafe',
                                                            color: '#1d4ed8',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        PDF
                                                    </span>
                                                )}
                                            </td>
                                            <td>{book.author}</td>
                                            <td>
                                                <span className="category-tag">{book.category}</span>
                                            </td>
                                            <td className="rating-cell">
                                                <span>★</span> {book.rating.toFixed(1)}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        title="Edit Book"
                                                        onClick={() => handleEdit(book)}
                                                    >
                                                        <img src={editIcon} alt="Edit" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        title="Delete Book"
                                                        onClick={() => void handleDelete(book)}
                                                    >
                                                        <img src={deleteIcon} alt="Delete" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="view-btn"
                                                        title="View Book"
                                                        onClick={() => setSelectedBook(book)}
                                                    >
                                                        <img src={viewIcon} alt="View" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredBooks.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="empty-message">
                                                No books found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            Showing {filteredBooks.length} of {books.length} books (synced with Supabase)
                        </div>
                    </div>
                </section>

                {/* USER ROLE MANAGEMENT */}
                <section className="admin-submissions" style={{ marginTop: '28px' }}>
                    <div className="admin-submissions-heading">
                        <div>
                            <span className="admin-submissions-eyebrow">ACCESS CONTROL</span>
                            <h2>Registered Users &amp; Roles</h2>
                            <p>Manage institutional roles for students, lecturers, researchers, and administrators.</p>
                        </div>
                        <span className="admin-submissions-count">{profiles.length} accounts</span>
=======
                        </div>
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8
                    </div>

                    <div className="table-container">
                        <table className="book-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cover</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBooks.map((book, index) => (
                                    <tr key={book.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            {book.image ? (
                                                <img
                                                    src={book.image}
                                                    alt={book.title}
                                                    className="table-book-image"
                                                />
                                            ) : (
                                                <div className="no-image">▣</div>
                                            )}
                                        </td>

                                        <td className="book-title-cell">
                                            {book.title}
                                        </td>

                                        <td>{book.author}</td>

                                        <td>
                                            <span className="category-tag">
                                                {book.category}
                                            </span>
                                        </td>

                                        <td className="rating-cell">
                                            <span>★</span> {book.rating.toFixed(1)}
                                        </td>

                                        <td>
                                            
<div className="table-actions">
    <button
        type="button"
        className="edit-btn"
        title="Edit Book"
        onClick={() => handleEdit(book)}
    >
        <img src={editIcon} alt="Edit" />
    </button>

    <button
        type="button"
        className="delete-btn"
        title="Delete Book"
        onClick={() => handleDelete(book.id)}
    >
        <img src={deleteIcon} alt="Delete" />
    </button>

    <button
        type="button"
        className="view-btn"
        title="View Book"
        onClick={() => setSelectedBook(book)}
    >
        <img src={viewIcon} alt="View" />
    </button>
</div>

                                        </td>
                                    </tr>
                                ))}

                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty-message">
                                            No books found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

<<<<<<< HEAD
                {/* VIEW MODAL */}
                {selectedBook && (
                    <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
                        <div
                            className="book-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Book details"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setSelectedBook(null)}
                                aria-label="Close book details"
                            >
                                ×
                            </button>

                            {selectedBook.coverImage && (
                                <img
                                    src={selectedBook.coverImage}
                                    alt={selectedBook.title}
                                    className="modal-book-image"
                                />
                            )}

                            <h2>{selectedBook.title}</h2>
                            <p><strong>Author:</strong> {selectedBook.author} ({selectedBook.year})</p>
                            <p><strong>Category:</strong> {selectedBook.category}</p>
                            <p><strong>Subjects:</strong> {selectedBook.subjects.join(', ')}</p>
                            <p><strong>Rating:</strong> ★ {selectedBook.rating.toFixed(1)}</p>
                            <p>{selectedBook.abstract}</p>
                            <p style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <a href={`#reading?id=${selectedBook.id}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                                    Open in Reading Mode →
                                </a>
                                {selectedBook.pdfUrl && (
                                    <a
                                        href={selectedBook.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#047857', fontWeight: 600 }}
                                    >
                                        Download / View PDF ↗
                                    </a>
                                )}
                            </p>
                        </div>
=======
                    <div className="table-footer">
                        Showing {filteredBooks.length} of {books.length} books
>>>>>>> 3ac3598359a3c054359af101cdab23fe5da89cd8
                    </div>
                </div>
            </section>

            {/* VIEW MODAL */}
            {selectedBook && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedBook(null)}
                >
                    <div
                        className="book-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Book details"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="modal-close"
                            onClick={() => setSelectedBook(null)}
                            aria-label="Close book details"
                        >
                            ×
                        </button>

                        {selectedBook.image && (
                            <img
                                src={selectedBook.image}
                                alt={selectedBook.title}
                                className="modal-book-image"
                            />
                        )}

                        <h2>{selectedBook.title}</h2>
                        <p><strong>Author:</strong> {selectedBook.author}</p>
                        <p><strong>Category:</strong> {selectedBook.category}</p>
                        <p><strong>Rating:</strong> ⭐ {selectedBook.rating}</p>
                        <p>{selectedBook.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
