import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './Admin.css';
import booksIcon from '../assets/books-icon.png';
import chaptersIcon from '../assets/chapters-icon.png';
import usersIcon from '../assets/users-icon.png';
import notesIcon from '../assets/notes-icon.png';
import editIcon from '../assets/edit-icon.png';
import deleteIcon from '../assets/delete-icon.png';
import viewIcon from '../assets/view-icon.png';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import type { BookItem } from '../types/book';
import { useAuth, type AppRole, type UserProfile } from '../context/useAuth';
import {
    deleteCatalogBook,
    fetchCatalogBooks,
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

const CATEGORIES: BookItem['category'][] = [
    'Featured Books',
    'Featured Research',
    'New Arrivals',
    'Popular',
];

const BADGES: Array<NonNullable<BookItem['badge']>> = [
    'Featured',
    'Bestseller',
    'New',
    'Trending',
    'Academic',
    'Popular',
];

const DEFAULT_YEAR = String(new Date().getFullYear());
const TODAY_FORMATTED = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

function Admin() {
    const { user, profile, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

    const [books, setBooks] = useState<BookItem[]>([]);
    const [studentPapers, setStudentPapers] = useState<ResearchPaper[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [stats, setStats] = useState<AdminOverviewStats>({
        totalBooks: 0,
        totalChapters: 0,
        registeredUsers: 0,
        totalNotes: 0,
        pendingPapers: 0,
    });
    const [loadedAdmin, setLoadedAdmin] = useState(false);
    const loadingData = isAuthenticated && isAdmin && !loadedAdmin;
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Form state
    const [editId, setEditId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState(DEFAULT_YEAR);
    const [language, setLanguage] = useState('en');
    const [isbn, setIsbn] = useState('');
    const [subjectsInput, setSubjectsInput] = useState('');
    const [category, setCategory] = useState<BookItem['category']>('Featured Books');
    const [badge, setBadge] = useState<string>('');
    const [rating, setRating] = useState('4.5');
    const [imagePreview, setImagePreview] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [savingBook, setSavingBook] = useState(false);

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

    useEffect(() => {
        if (authLoading || !isAuthenticated || !isAdmin) return;
        let active = true;
        void Promise.all([
            fetchCatalogBooks(),
            fetchAllSubmittedPapers(),
            fetchAllProfiles(),
        ])
            .then(async ([loadedBooks, loadedPapers, loadedProfiles]) => {
                if (!active) return;
                setBooks(loadedBooks);
                setStudentPapers(loadedPapers);
                setProfiles(loadedProfiles);
                const overview = await fetchAdminOverviewStats(loadedBooks);
                if (active) {
                    setStats(overview);
                    setErrorMessage('');
                }
            })
            .catch((err) => {
                if (!active) return;
                setErrorMessage(err instanceof Error ? err.message : 'Could not load admin dashboard data.');
            })
            .finally(() => {
                if (active) setLoadedAdmin(true);
            });

        return () => {
            active = false;
        };
    }, [authLoading, isAuthenticated, isAdmin]);

    async function handlePaperReview(id: string, status: PaperStatus) {
        if (!user) return;
        const paper = studentPapers.find(item => item.id === id);
        if (!paper) return;

        const reviewerNote =
            status === 'revision'
                ? window.prompt('Share feedback to guide the student’s revision:')
                : 'Approved for publication.';
        if (reviewerNote === null) return;

        try {
            const updatedPaper = await reviewResearchPaper(id, status, reviewerNote, user.id);
            setStudentPapers(prev => prev.map(item => (item.id === id ? updatedPaper : item)));
            setStats(prev => ({
                ...prev,
                pendingPapers: prev.pendingPapers - (paper.status === 'pending' && status !== 'pending' ? 1 : 0),
            }));
            setStatusMessage(
                status === 'approved'
                    ? `"${paper.title}" approved and published to the Research Repository.`
                    : `Revision requested for "${paper.title}".`
            );
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not save the paper review.');
        }
    }

    async function handleDownloadPaper(paper: ResearchPaper) {
        try {
            await downloadResearchPaperFile(paper);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not download the student paper.');
        }
    }

    function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file (JPG, PNG, WEBP, GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Cover image must be 5 MB or smaller.');
            return;
        }

        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function clearForm() {
        setTitle('');
        setAuthor('');
        setYear(String(new Date().getFullYear()));
        setLanguage('en');
        setIsbn('');
        setSubjectsInput('');
        setCategory('Featured Books');
        setBadge('');
        setRating('4.5');
        setImagePreview('');
        setCoverFile(null);
        setDescription('');
        setEditId(null);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSavingBook(true);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const existing = editId ? books.find(b => b.id === editId) : undefined;
            const subjects = subjectsInput
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

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
                    chapters: existing?.chapters,
                    aiSummary: existing?.aiSummary,
                },
                user?.id
            );

            setBooks(prev =>
                editId ? prev.map(b => (b.id === saved.id ? saved : b)) : [saved, ...prev]
            );
            setStatusMessage(
                editId
                    ? `"${saved.title}" updated in Supabase catalog and re-indexed.`
                    : `"${saved.title}" added to Supabase catalog and indexed for semantic search.`
            );
            clearForm();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not save book.');
        } finally {
            setSavingBook(false);
        }
    }

    function handleEdit(book: BookItem) {
        setEditId(book.id);
        setTitle(book.title);
        setAuthor(book.author);
        setYear(String(book.year));
        setLanguage(book.language);
        setIsbn(book.isbn);
        setSubjectsInput(book.subjects.join(', '));
        setCategory(book.category);
        setBadge(book.badge || '');
        setRating(String(book.rating));
        setImagePreview(book.coverImage || '');
        setCoverFile(null);
        setDescription(book.abstract);

        document.querySelector('.add-book-card')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Are you sure you want to permanently delete this book from the catalog?')) {
            return;
        }
        try {
            await deleteCatalogBook(id);
            setBooks(prev => prev.filter(book => book.id !== id));
            if (editId === id) clearForm();
            if (selectedBook?.id === id) setSelectedBook(null);
            setStatusMessage('Book deleted from catalog.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not delete book.');
        }
    }

    async function handleRoleChange(targetId: string, nextRole: AppRole) {
        try {
            const updated = await updateProfileRole(targetId, nextRole);
            setProfiles(prev => prev.map(p => (p.id === targetId ? updated : p)));
            setStatusMessage(`Updated role for ${updated.full_name} to "${updated.role}".`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not update user role.');
        }
    }

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filter === 'All' || book.category === filter;
        return matchesSearch && matchesCategory;
    });

    if (!authLoading && (!isAuthenticated || !isAdmin)) {
        return (
            <>
                <Navigation />
                <main style={{ maxWidth: '640px', margin: '80px auto', padding: '36px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span className="admin-submissions-eyebrow">RESTRICTED ACCESS</span>
                    <h1 style={{ margin: '8px 0 12px' }}>Administrator Access Required</h1>
                    <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '22px' }}>
                        {!isAuthenticated
                            ? 'Please sign in with an administrator account to manage the university catalog and review student research submissions.'
                            : `Your account (${profile?.email || user?.email}) currently has the "${profile?.role || 'student'}" role. Only accounts with the "admin" role can access this dashboard.`}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {!isAuthenticated ? (
                            <a href="#login" className="add-book-btn" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                                Sign In
                            </a>
                        ) : (
                            <a href="#student-dashboard" className="add-book-btn" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                                Go to Student Dashboard
                            </a>
                        )}
                        <a href="#home" className="reset-btn" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                            Back to Home
                        </a>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navigation />
            <div className="admin-page">
                {/* WELCOME BANNER */}
                <section className="welcome-banner">
                    <div className="welcome-content">
                        <div className="welcome-logo">
                            <img src={logo} alt="IULS Logo" />
                        </div>
                        <div className="welcome-divider"></div>
                        <div className="welcome-text">
                            <h1>Welcome, {profile?.full_name || 'Admin'}!</h1>
                            <p>Manage the Supabase library catalog, research submissions, and user roles.</p>
                        </div>
                    </div>

                    <div className="admin-date">
                        <span>▣</span> {TODAY_FORMATTED}
                    </div>
                </section>

                {(errorMessage || statusMessage) && (
                    <div
                        role={errorMessage ? 'alert' : 'status'}
                        style={{
                            maxWidth: '1240px',
                            margin: '0 auto 18px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: errorMessage ? '#fef2f2' : '#ecfdf5',
                            border: `1px solid ${errorMessage ? '#fecaca' : '#a7f3d0'}`,
                            color: errorMessage ? '#b91c1c' : '#065f46',
                            fontSize: '14px',
                        }}
                    >
                        {errorMessage || statusMessage}
                    </div>
                )}

                {/* LIVE STATISTICS */}
                <section className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-icon"><img src={booksIcon} alt="Books" /></div>
                        <div className="stat-info">
                            <p>Catalog Books</p>
                            <h2>{books.length}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><img src={chaptersIcon} alt="Chapters" /></div>
                        <div className="stat-info">
                            <p>Total Chapters</p>
                            <h2>{books.reduce((sum, b) => sum + b.chapters.length, 0)}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><img src={usersIcon} alt="Users" /></div>
                        <div className="stat-info">
                            <p>Registered Users</p>
                            <h2>{stats.registeredUsers}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><img src={notesIcon} alt="Pending Papers" /></div>
                        <div className="stat-info">
                            <p>Pending Papers</p>
                            <h2>{studentPapers.filter(p => p.status === 'pending').length}</h2>
                        </div>
                    </div>
                </section>

                {/* STUDENT RESEARCH REVIEW */}
                <section className="admin-submissions">
                    <div className="admin-submissions-heading">
                        <div>
                            <span className="admin-submissions-eyebrow">STUDENT SCHOLARSHIP</span>
                            <h2>Research submissions</h2>
                            <p>Review student manuscripts before they appear in the Research Repository.</p>
                        </div>
                        <span className="admin-submissions-count">
                            {studentPapers.filter(paper => paper.status === 'pending').length} awaiting review
                        </span>
                    </div>

                    {loadingData ? (
                        <div className="admin-submissions-empty">Loading submissions from Supabase...</div>
                    ) : studentPapers.length ? (
                        <div className="admin-submissions-list">
                            {studentPapers.map(paper => (
                                <article className="admin-submission-card" key={paper.id}>
                                    <div className="admin-submission-info">
                                        <span className={`admin-paper-status admin-paper-status--${paper.status}`}>
                                            {paper.status === 'approved'
                                                ? 'Published'
                                                : paper.status === 'revision'
                                                ? 'Revision requested'
                                                : 'Pending review'}
                                        </span>
                                        <h3>{paper.title}</h3>
                                        <p>
                                            {paper.authors} · {paper.field} · Submitted{' '}
                                            {new Date(paper.submittedAt).toLocaleDateString()}
                                        </p>
                                        <p className="admin-submission-abstract">{paper.abstract}</p>
                                        {paper.reviewerNote && (
                                            <p className="admin-review-feedback">
                                                <strong>Feedback:</strong> {paper.reviewerNote}
                                            </p>
                                        )}
                                    </div>
                                    <div className="admin-submission-actions">
                                        {paper.filePath && (
                                            <button
                                                type="button"
                                                className="admin-review-secondary"
                                                onClick={() => void handleDownloadPaper(paper)}
                                            >
                                                Download paper
                                            </button>
                                        )}
                                        {paper.status !== 'approved' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="admin-review-secondary"
                                                    onClick={() => void handlePaperReview(paper.id, 'revision')}
                                                >
                                                    Request revision
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-review-approve"
                                                    onClick={() => void handlePaperReview(paper.id, 'approved')}
                                                >
                                                    Approve &amp; publish
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-submissions-empty">No student papers have been submitted yet.</div>
                    )}
                </section>

                {/* BOOK MANAGEMENT */}
                <section className="book-management">
                    <div className="add-book-card">
                        <h2 className="card-heading">
                            <span className="heading-icon">+</span>
                            {editId !== null ? 'Edit Catalog Book' : 'Add New Catalog Book'}
                        </h2>

                        <form onSubmit={(e) => void handleSubmit(e)}>
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

                            <label htmlFor="admin-category">Catalog Section</label>
                            <select
                                id="admin-category"
                                value={category}
                                onChange={e => setCategory(e.target.value as BookItem['category'])}
                                required
                            >
                                {CATEGORIES.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>

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
                                            <td className="book-title-cell">{book.title}</td>
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
                                                        onClick={() => void handleDelete(book.id)}
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
                    </div>

                    <div className="table-container">
                        <table className="book-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map(p => (
                                    <tr key={p.id}>
                                        <td className="book-title-cell">{p.full_name}</td>
                                        <td>{p.email}</td>
                                        <td>{p.department}</td>
                                        <td>
                                            <select
                                                value={p.role}
                                                disabled={p.id === user?.id}
                                                onChange={(e) => void handleRoleChange(p.id, e.target.value as AppRole)}
                                                className="filter-select"
                                                aria-label={`Role for ${p.full_name}`}
                                            >
                                                <option value="student">Student</option>
                                                <option value="lecturer">Lecturer</option>
                                                <option value="researcher">Researcher</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

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
                            <p>
                                <a href={`#reading?id=${selectedBook.id}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                                    Open in Reading Mode →
                                </a>
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Admin;
