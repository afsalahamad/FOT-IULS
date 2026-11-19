import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import logo from '../assets/logo.png';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { BookCover } from '../components/BookCover';
import BulkBookUpload from './bulk_books';
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
import './Admin.css';

type AdminTab = 'overview' | 'catalog' | 'research' | 'users' | 'bulk';

const ADMIN_TABS: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'catalog', label: 'Catalog Books', icon: '▤' },
    { id: 'research', label: 'Research Review', icon: '◇' },
    { id: 'users', label: 'Users & Roles', icon: '◈' },
    { id: 'bulk', label: 'Bulk Import', icon: '⇪' },
];

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

    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
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
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [parsedChapters, setParsedChapters] = useState<Chapter[] | null>(null);
    const [parsingPdf, setParsingPdf] = useState(false);
    const [pdfInfoText, setPdfInfoText] = useState('');
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

    const pendingPapersCount = studentPapers.filter(p => p.status === 'pending').length;
    const totalChaptersCount = books.reduce((sum, b) => sum + b.chapters.length, 0);

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
        setDescription('');
        setEditId(null);
        const pdfInput = document.getElementById('book-pdf') as HTMLInputElement | null;
        if (pdfInput) pdfInput.value = '';
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
                    coverImage: existing?.coverImage || '',
                    coverFile,
                    pdfUrl: existing?.pdfUrl,
                    pdfPath: existing?.pdfPath,
                    pdfFile,
                    chapters: parsedChapters ?? existing?.chapters,
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
        setPdfFile(null);
        setParsedChapters(null);
        setPdfInfoText(book.pdfUrl ? 'Existing PDF attached (select a new file to replace).' : '');
        setDescription(book.abstract);
        setActiveTab('catalog');

        setTimeout(() => {
            document.getElementById('admin-title')?.focus();
        }, 50);
    }

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
            <div className="admin-page">
                <Navigation />
                <main className="admin-restricted-card">
                    <p className="admin-eyebrow">RESTRICTED ACCESS</p>
                    <h1>Administrator Access Required</h1>
                    <p>
                        {!isAuthenticated
                            ? 'Please sign in with an administrator account to manage the university catalog and review student research submissions.'
                            : `Your account (${profile?.email || user?.email}) currently has the "${profile?.role || 'student'}" role. Only accounts with the "admin" role can access this dashboard.`}
                    </p>
                    <div className="admin-action-row" style={{ justifyContent: 'center' }}>
                        {!isAuthenticated ? (
                            <a href="#login" className="admin-primary-button">
                                Sign In
                            </a>
                        ) : (
                            <a href="#student-dashboard" className="admin-primary-button">
                                Go to Student Dashboard
                            </a>
                        )}
                        <a href="#home" className="admin-secondary-button">
                            Back to Home
                        </a>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Navigation />
            <main className="admin-dashboard">
                {/* UNIFIED ACADEMIC SIDEBAR */}
                <aside className="admin-sidebar" aria-label="Administrator workspace">
                    <div className="admin-sidebar-brand">
                        <div className="admin-brand-mark">
                            <img src={logo} alt="University Library Logo" />
                        </div>
                        <div className="admin-brand-text">
                            <strong>Admin Portal</strong>
                            <small>Catalog, Research &amp; Governance</small>
                        </div>
                    </div>

                    <nav className="admin-side-nav" aria-label="Admin dashboard sections">
                        {ADMIN_TABS.map((tab) => (
                            <button
                                type="button"
                                key={tab.id}
                                className={activeTab === tab.id ? 'is-active' : ''}
                                onClick={() => setActiveTab(tab.id)}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                <span aria-hidden="true">{tab.icon}</span>
                                {tab.label}
                                {tab.id === 'research' && pendingPapersCount > 0 && (
                                    <small>{pendingPapersCount}</small>
                                )}
                                {tab.id === 'catalog' && books.length > 0 && (
                                    <small>{books.length}</small>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* MAIN WORKSPACE */}
                <section className="admin-main">
                    <header className="admin-welcome">
                        <div>
                            <p className="admin-eyebrow">IULS ADMINISTRATION · {TODAY_FORMATTED}</p>
                            <h1>Welcome, {profile?.full_name || 'Administrator'}.</h1>
                            <p>Manage the university textbook catalog, peer-review student research, and oversee institutional accounts.</p>
                        </div>
                        <button
                            type="button"
                            className="admin-primary-button"
                            onClick={() => {
                                clearForm();
                                setActiveTab('catalog');
                                setTimeout(() => document.getElementById('admin-title')?.focus(), 50);
                            }}
                        >
                            <span aria-hidden="true">＋</span> Add catalog book
                        </button>
                    </header>

                    {(errorMessage || statusMessage) && (
                        <div
                            className={`admin-alert ${errorMessage ? 'admin-alert--error' : ''}`}
                            role={errorMessage ? 'alert' : 'status'}
                        >
                            <span>{errorMessage || statusMessage}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setErrorMessage('');
                                    setStatusMessage('');
                                }}
                                aria-label="Dismiss message"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {loadingData && (
                        <div className="admin-loading-note">Syncing catalog, submissions, and accounts from Supabase...</div>
                    )}

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="admin-tab-content">
                            <div className="admin-stat-grid">
                                <article>
                                    <span>Catalog books</span>
                                    <strong>{books.length}</strong>
                                    <small>{books.filter(b => Boolean(b.pdfUrl)).length} with full PDFs</small>
                                </article>
                                <article>
                                    <span>Indexed chapters</span>
                                    <strong>{totalChaptersCount}</strong>
                                    <small>Available in AI Reader</small>
                                </article>
                                <article>
                                    <span>Registered users</span>
                                    <strong>{stats.registeredUsers || profiles.length}</strong>
                                    <small>{profiles.filter(p => p.role === 'admin').length} admin accounts</small>
                                </article>
                                <article>
                                    <span>Pending research</span>
                                    <strong>{pendingPapersCount}</strong>
                                    <small>{studentPapers.filter(p => p.status === 'approved').length} published papers</small>
                                </article>
                            </div>

                            <div className="admin-overview-grid">
                                <section className="admin-panel">
                                    <div className="admin-panel-heading">
                                        <div>
                                            <p className="admin-eyebrow">QUICK ACTIONS</p>
                                            <h2>Manage university collections</h2>
                                        </div>
                                        <span aria-hidden="true">✦</span>
                                    </div>
                                    <p className="admin-panel-intro">
                                        Upload real textbooks with automatic PDF chapter extraction, review student scholarship, or import catalog records in bulk.
                                    </p>
                                    <div className="admin-action-row">
                                        <button
                                            type="button"
                                            className="admin-primary-button"
                                            onClick={() => setActiveTab('catalog')}
                                        >
                                            Manage catalog
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-secondary-button"
                                            onClick={() => setActiveTab('research')}
                                        >
                                            Review research ({pendingPapersCount})
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-secondary-button"
                                            onClick={() => setActiveTab('bulk')}
                                        >
                                            Bulk CSV import
                                        </button>
                                    </div>
                                </section>

                                <section className="admin-panel">
                                    <p className="admin-eyebrow">CATALOG COVERAGE</p>
                                    <h2 style={{ margin: '6px 0 14px', color: '#102B46', fontSize: '19px' }}>
                                        PDF &amp; Cover Readiness
                                    </h2>
                                    <div className="admin-progress-track">
                                        <span
                                            style={{
                                                width: `${books.length ? Math.round((books.filter(b => Boolean(b.pdfUrl) && Boolean(b.coverImage)).length / books.length) * 100) : 0}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="admin-panel-intro" style={{ margin: '12px 0 0' }}>
                                        {books.filter(b => Boolean(b.pdfUrl) && Boolean(b.coverImage)).length} of {books.length} books have both real cover artwork and downloadable PDFs.
                                    </p>
                                </section>
                            </div>

                            {/* RECENT BOOKS STRIP */}
                            <section className="admin-panel">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">RECENT CATALOG ENTRIES</p>
                                        <h2>Published library titles</h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-text-button"
                                        onClick={() => setActiveTab('catalog')}
                                    >
                                        View full catalog →
                                    </button>
                                </div>
                                <div className="admin-book-strip">
                                    {books.slice(0, 3).map(book => (
                                        <article className="admin-mini-book" key={book.id}>
                                            <div className="admin-mini-book-cover">
                                                <BookCover
                                                    src={book.coverImage}
                                                    title={book.title}
                                                    author={book.author}
                                                    gradient={book.coverGradient}
                                                    compact
                                                />
                                            </div>
                                            <div className="admin-mini-book-info">
                                                <h3>{book.title}</h3>
                                                <p>{book.author}</p>
                                                <div className="admin-mini-book-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-text-button"
                                                        onClick={() => handleEdit(book)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-text-button"
                                                        onClick={() => setSelectedBook(book)}
                                                    >
                                                        Inspect
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            {/* LATEST PENDING RESEARCH */}
                            <section className="admin-panel">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">STUDENT SCHOLARSHIP</p>
                                        <h2>Latest research submissions</h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-text-button"
                                        onClick={() => setActiveTab('research')}
                                    >
                                        Open review queue →
                                    </button>
                                </div>
                                {studentPapers.length ? (
                                    <div className="admin-submissions-list">
                                        {studentPapers.slice(0, 2).map(paper => (
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
                                                    <p className="admin-submission-meta">
                                                        {paper.authors} · {paper.field} · {new Date(paper.submittedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="admin-submission-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-secondary-button"
                                                        onClick={() => setActiveTab('research')}
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="admin-empty-state">
                                        <span aria-hidden="true">◇</span>
                                        <h3>No student submissions yet</h3>
                                        <p>Student manuscripts uploaded from the Student Dashboard will appear here for review.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* TAB: CATALOG BOOKS */}
                    {activeTab === 'catalog' && (
                        <div className="admin-tab-content admin-catalog-layout">
                            <section className="admin-panel add-book-card">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">CATALOG EDITOR</p>
                                        <h2>{editId !== null ? 'Edit Catalog Book' : 'Add New Catalog Book'}</h2>
                                    </div>
                                    <span aria-hidden="true">＋</span>
                                </div>

                                <form className="admin-form" onSubmit={(e) => void handleSubmit(e)}>
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

                                    <div className="admin-form-row">
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

                                    <div className="admin-form-row">
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
                                    <div className="admin-image-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="book-image"
                                            onChange={handleImageUpload}
                                        />
                                        <label htmlFor="book-image" className="admin-upload-label">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Book preview"
                                                    className="admin-upload-preview"
                                                />
                                            ) : (
                                                <>
                                                    <span className="admin-upload-icon">☁</span>
                                                    <strong>Click to upload cover</strong>
                                                    <small>JPG, PNG, WEBP · max 5 MB</small>
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
                                        <p className="admin-file-hint">{pdfInfoText}</p>
                                    )}

                                    <label htmlFor="admin-description">Abstract / Description</label>
                                    <textarea
                                        id="admin-description"
                                        placeholder="Enter book abstract..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                    />

                                    <div className="admin-action-row">
                                        <button type="submit" className="admin-primary-button" disabled={savingBook} style={{ flex: 1 }}>
                                            {savingBook
                                                ? 'Saving...'
                                                : editId !== null
                                                ? 'Update Book'
                                                : '+ Add Book'}
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-secondary-button"
                                            onClick={clearForm}
                                            disabled={savingBook}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="admin-panel book-list-card">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">LIBRARY INVENTORY</p>
                                        <h2>Unified Library Catalog</h2>
                                    </div>
                                    <span className="admin-count-badge">{filteredBooks.length}</span>
                                </div>

                                <div className="admin-book-tools">
                                    <input
                                        type="search"
                                        placeholder="Search by title or author..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        aria-label="Search books"
                                    />
                                    <select
                                        value={filter}
                                        onChange={e => setFilter(e.target.value)}
                                        aria-label="Filter by category"
                                    >
                                        <option value="All">All Categories</option>
                                        {CATEGORIES.map(item => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Cover</th>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Rating</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBooks.map((book) => (
                                                <tr key={book.id}>
                                                    <td>
                                                        <div className="admin-table-cover">
                                                            <BookCover
                                                                src={book.coverImage}
                                                                title={book.title}
                                                                author={book.author}
                                                                gradient={book.coverGradient}
                                                                compact
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="admin-book-title-cell">
                                                            <span>{book.title}</span>
                                                            {book.pdfUrl && (
                                                                <span className="admin-pdf-pill">PDF</span>
                                                            )}
                                                        </div>
                                                        <small className="admin-book-author-sub">
                                                            {book.author} · {book.year}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="admin-category-tag">{book.category}</span>
                                                    </td>
                                                    <td className="admin-rating-cell">
                                                        ★ {book.rating.toFixed(1)}
                                                    </td>
                                                    <td>
                                                        <div className="admin-table-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-chip-btn"
                                                                onClick={() => setSelectedBook(book)}
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-chip-btn"
                                                                onClick={() => handleEdit(book)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-chip-btn admin-chip-btn--danger"
                                                                onClick={() => void handleDelete(book)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredBooks.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="admin-empty-cell">
                                                        No books match your search criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="admin-table-footer">
                                    Showing {filteredBooks.length} of {books.length} books (synced with Supabase)
                                </div>
                            </section>
                        </div>
                    )}

                    {/* TAB: RESEARCH REVIEW */}
                    {activeTab === 'research' && (
                        <div className="admin-tab-content">
                            <section className="admin-panel">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">STUDENT SCHOLARSHIP</p>
                                        <h2>Research submission review queue</h2>
                                    </div>
                                    <span className="admin-count-badge">
                                        {pendingPapersCount} pending
                                    </span>
                                </div>
                                <p className="admin-panel-intro">
                                    Inspect student manuscripts, download attached files, request revisions, or approve papers for public display in the Research Repository.
                                </p>

                                {studentPapers.length ? (
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
                                                    <p className="admin-submission-meta">
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
                                                            className="admin-secondary-button"
                                                            onClick={() => void handleDownloadPaper(paper)}
                                                        >
                                                            Download paper
                                                        </button>
                                                    )}
                                                    {paper.status !== 'approved' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="admin-secondary-button"
                                                                onClick={() => void handlePaperReview(paper.id, 'revision')}
                                                            >
                                                                Request revision
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-primary-button"
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
                                    <div className="admin-empty-state">
                                        <span aria-hidden="true">◇</span>
                                        <h3>No student papers have been submitted yet</h3>
                                        <p>When students submit manuscripts through their dashboard, they will appear here.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* TAB: USERS & ROLES */}
                    {activeTab === 'users' && (
                        <div className="admin-tab-content">
                            <section className="admin-panel">
                                <div className="admin-panel-heading">
                                    <div>
                                        <p className="admin-eyebrow">ACCESS CONTROL</p>
                                        <h2>Registered Users &amp; Roles</h2>
                                    </div>
                                    <span className="admin-count-badge">{profiles.length} accounts</span>
                                </div>
                                <p className="admin-panel-intro">
                                    Manage institutional roles for students, lecturers, researchers, and administrators.
                                </p>

                                <div className="admin-table-container">
                                    <table className="admin-table">
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
                                                    <td className="admin-book-title-cell">{p.full_name}</td>
                                                    <td>{p.email}</td>
                                                    <td>{p.department}</td>
                                                    <td>
                                                        <select
                                                            value={p.role}
                                                            disabled={p.id === user?.id}
                                                            onChange={(e) => void handleRoleChange(p.id, e.target.value as AppRole)}
                                                            className="admin-role-select"
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
                        </div>
                    )}

                    {/* TAB: BULK IMPORT */}
                    {activeTab === 'bulk' && (
                        <div className="admin-tab-content">
                            <BulkBookUpload />
                        </div>
                    )}
                </section>
            </main>

            {/* BOOK INSPECTION MODAL */}
            {selectedBook && (
                <div className="admin-modal-overlay" onClick={() => setSelectedBook(null)}>
                    <div
                        className="admin-book-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Book details"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={() => setSelectedBook(null)}
                            aria-label="Close book details"
                        >
                            ×
                        </button>

                        <div className="admin-modal-header">
                            <div className="admin-modal-cover">
                                <BookCover
                                    src={selectedBook.coverImage}
                                    title={selectedBook.title}
                                    author={selectedBook.author}
                                    gradient={selectedBook.coverGradient}
                                />
                            </div>
                            <div>
                                <span className="admin-category-tag">{selectedBook.category}</span>
                                <h2>{selectedBook.title}</h2>
                                <p className="admin-modal-author">
                                    {selectedBook.author} ({selectedBook.year})
                                </p>
                                <p className="admin-rating-cell">★ {selectedBook.rating.toFixed(1)} / 5</p>
                            </div>
                        </div>

                        <p className="admin-modal-meta">
                            <strong>Subjects:</strong> {selectedBook.subjects.join(', ')}
                        </p>
                        {selectedBook.isbn && (
                            <p className="admin-modal-meta">
                                <strong>ISBN:</strong> {selectedBook.isbn}
                            </p>
                        )}
                        <p className="admin-modal-abstract">{selectedBook.abstract}</p>

                        <div className="admin-action-row">
                            <a href={`#reading?id=${selectedBook.id}`} className="admin-primary-button">
                                Open in Reading Mode →
                            </a>
                            {selectedBook.pdfUrl && (
                                <a
                                    href={selectedBook.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-secondary-button"
                                >
                                    Download / View PDF ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Admin;
