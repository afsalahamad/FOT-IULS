import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import logo from '../assets/logo.png';
import Footer from "../components/Footer";
import { INITIAL_BOOKS } from "../data/booksData";
import type { BookItem } from "../types/book";
import { useAuth } from "../context/useAuth";
import { fetchCatalogBooks } from "../lib/catalogService";
import {
  deleteStudentNote,
  downloadBookText,
  downloadResearchPaperFile,
  fetchMyResearchPapers,
  fetchSavedBookIds,
  fetchStudentNotes,
  saveStudentNote,
  submitResearchPaper,
  toggleSavedBookInDb,
  type ResearchPaper,
  type StudentNote,
} from "../lib/workspaceService";
import "./StudentDashboard.css";

type DashboardTab = "overview" | "research" | "library" | "notes";

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "research", label: "My research", icon: "◇" },
  { id: "library", label: "Saved library", icon: "▤" },
  { id: "notes", label: "Notes", icon: "✎" },
];

export function StudentDashboard({ profileName = "Scholar" }: { profileName?: string }) {
  const { user, isAuthenticated, loading: authLoading, displayName } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [catalogBooks, setCatalogBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const loadingData = Boolean(user) && loadedUserId !== user?.id;
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paperForm, setPaperForm] = useState({ title: "", authors: "", field: "", abstract: "" });
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", bookId: "", body: "" });

  useEffect(() => {
    let active = true;
    void fetchCatalogBooks().then((loaded) => {
      if (active) setCatalogBooks(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;
    void Promise.all([
      fetchMyResearchPapers(user.id),
      fetchStudentNotes(user.id),
      fetchSavedBookIds(user.id),
    ])
      .then(([loadedPapers, loadedNotes, loadedSaved]) => {
        if (!active) return;
        setPapers(loadedPapers);
        setNotes(loadedNotes);
        setSavedBookIds(loadedSaved);
        setWorkspaceError("");
      })
      .catch((error) => {
        if (!active) return;
        setWorkspaceError(
          error instanceof Error ? error.message : "Could not load your student workspace."
        );
      })
      .finally(() => {
        if (active) setLoadedUserId(user.id);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const savedBooks = useMemo(
    () => catalogBooks.filter((book) => savedBookIds.includes(book.id)),
    [catalogBooks, savedBookIds]
  );
  const pendingCount = papers.filter((paper) => paper.status === "pending").length;
  const publishedCount = papers.filter((paper) => paper.status === "approved").length;
  const resolvedName = displayName !== "Guest" ? displayName : profileName;
  const welcomeName = resolvedName.split(/\s+/)[0] || "Scholar";

  const toggleSavedBook = async (bookId: string) => {
    if (!user) return;
    const currentlySaved = savedBookIds.includes(bookId);
    const updated = currentlySaved
      ? savedBookIds.filter((id) => id !== bookId)
      : [...savedBookIds, bookId];

    setSavedBookIds(updated);
    try {
      await toggleSavedBookInDb(user.id, bookId, currentlySaved);
      setNotice(
        !currentlySaved ? "Book saved to your library." : "Book removed from your saved library."
      );
      setWorkspaceError("");
    } catch (error) {
      setSavedBookIds(savedBookIds);
      setWorkspaceError(
        error instanceof Error ? error.message : "Could not update your saved library."
      );
    }
  };

  const handlePaperSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (!paperFile) {
      setWorkspaceError("Choose a research paper file before submitting.");
      return;
    }
    if (paperFile.size > 20 * 1024 * 1024) {
      setWorkspaceError("The paper must be 20 MB or smaller.");
      return;
    }
    if (!/\.(pdf|docx?)$/i.test(paperFile.name)) {
      setWorkspaceError("Upload a PDF, DOC, or DOCX research file.");
      return;
    }

    setIsSubmitting(true);
    setWorkspaceError("");
    try {
      const created = await submitResearchPaper(user.id, paperForm, paperFile);
      setPapers((prev) => [created, ...prev]);
      setPaperForm({ title: "", authors: "", field: "", abstract: "" });
      setPaperFile(null);
      const fileInput = document.getElementById("student-paper-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setNotice("Your paper was uploaded and submitted to the admin review queue.");
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Could not save your research submission."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadBook = (bookId: string) => {
    const book = catalogBooks.find((item) => item.id === bookId);
    if (!book) return;
    downloadBookText(book);
    setNotice("Available book text downloaded.");
  };

  const openNote = (note?: StudentNote) => {
    setEditingNoteId(note?.id ?? null);
    setNoteForm(
      note
        ? { title: note.title, bookId: note.bookId, body: note.body }
        : { title: "", bookId: "", body: "" }
    );
    setActiveTab("notes");
  };

  const handleSaveNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    try {
      const saved = await saveStudentNote(user.id, {
        id: editingNoteId,
        ...noteForm,
      });
      setNotes((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      setEditingNoteId(saved.id);
      setWorkspaceError("");
      setNotice("Your note was saved.");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not save your note.");
    }
  };

  const handleRemoveNote = async (noteId: string) => {
    try {
      await deleteStudentNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (editingNoteId === noteId) openNote();
      setWorkspaceError("");
      setNotice("Note deleted.");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not delete your note.");
    }
  };

  const handleAttachmentDownload = async (paper: ResearchPaper) => {
    try {
      await downloadResearchPaperFile(paper);
      setWorkspaceError("");
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Could not download the uploaded paper."
      );
    }
  };

  const renderPaperCard = (paper: ResearchPaper) => (
    <article className="student-paper-card" key={paper.id}>
      <div className="student-paper-card-heading">
        <div>
          <span className={`student-status student-status--${paper.status}`}>
            {paper.status === "approved"
              ? "Published"
              : paper.status === "revision"
              ? "Revision requested"
              : "In review"}
          </span>
          <h3>{paper.title}</h3>
        </div>
        {paper.filePath && (
          <button
            type="button"
            className="student-text-button"
            onClick={() => void handleAttachmentDownload(paper)}
          >
            Download file
          </button>
        )}
      </div>
      <p className="student-paper-meta">
        {paper.authors} · {paper.field} · {new Date(paper.submittedAt).toLocaleDateString()}
      </p>
      <p className="student-paper-abstract">{paper.abstract}</p>
      {paper.reviewerNote && (
        <p className="student-review-note">
          <strong>Reviewer feedback:</strong> {paper.reviewerNote}
        </p>
      )}
      {paper.status === "approved" && (
        <a className="student-text-button" href="#research">
          View in Research Repository →
        </a>
      )}
      {paper.status === "revision" && (
        <button
          type="button"
          className="student-secondary-button"
          onClick={() => {
            setPaperForm({
              title: paper.title,
              authors: paper.authors,
              field: paper.field,
              abstract: paper.abstract,
            });
            setPaperFile(null);
            setActiveTab("research");
          }}
        >
          Prepare a revised submission
        </button>
      )}
    </article>
  );

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="student-page">
        <Navigation profileName={profileName} />
        <main style={{ maxWidth: "620px", margin: "80px auto", padding: "36px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p className="student-eyebrow">STUDENT WORKSPACE</p>
          <h1 style={{ marginBottom: "10px" }}>Sign in to access your workspace</h1>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Your research submissions, saved books, and study notes are stored securely per account in Supabase so you can access them from any device.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <a href="#login" className="student-primary-button" style={{ textDecoration: "none" }}>
              Sign In
            </a>
            <a href="#signup" className="student-secondary-button" style={{ textDecoration: "none" }}>
              Create Account
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="student-page">
      <Navigation profileName={resolvedName} />
      <main className="student-dashboard">
        {/* PROFESSIONAL IULS SIDEBAR */}
{/* PROFESSIONAL STUDENT SIDEBAR */}
<aside className="student-sidebar" aria-label="Student workspace">

  {/* LIBRARY BRANDING */}
  <div className="student-sidebar-brand">

    <div className="student-brand-mark">
      <img
        src={logo}
        alt="University Library Logo"
      />
    </div>

    <div className="student-brand-text">
      <strong>Student Library</strong>
      <small>Your Space to Learn and Discover</small>
    </div>

  </div>

  {/* SIDEBAR NAVIGATION */}
  <nav className="student-side-nav" aria-label="Dashboard sections">

    {TABS.map((tab) => (

      <button
        type="button"
        key={tab.id}
        className={activeTab === tab.id ? "is-active" : ""}
        onClick={() => setActiveTab(tab.id)}
        aria-current={activeTab === tab.id ? "page" : undefined}
      >

        <span aria-hidden="true">
          {tab.id === "overview" && "⌂"}
          {tab.id === "research" && "◇"}
          {tab.id === "library" && "▤"}
          {tab.id === "notes" && "✎"}
        </span>

        {tab.id === "overview" && "Dashboard"}
        {tab.id === "research" && "My research"}
        {tab.id === "library" && "Saved library"}
        {tab.id === "notes" && "My notes"}

        {tab.id === "research" && pendingCount > 0 && (
          <small>{pendingCount}</small>
        )}

      </button>

    ))}

  </nav>

</aside>

        <section className="student-main">
          <header className="student-welcome">
            <div>
              <p className="student-eyebrow">YOUR IULS WORKSPACE</p>
              <h1>Good to see you, {welcomeName}.</h1>
              <p>A cloud-synced space for your reading, research submissions, and study notes.</p>
            </div>
            <button
              type="button"
              className="student-primary-button"
              onClick={() => {
                setActiveTab("research");
                setTimeout(() => document.getElementById("student-paper-title")?.focus(), 50);
              }}
            >
              <span aria-hidden="true">＋</span> Submit research
            </button>
          </header>

          {(workspaceError || notice) && (
            <div
              className={`student-alert ${workspaceError ? "student-alert--error" : ""}`}
              role={workspaceError ? "alert" : "status"}
            >
              <span>{workspaceError || notice}</span>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceError("");
                  setNotice("");
                }}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {loadingData && (
            <div className="student-local-note">Loading your synced workspace from Supabase...</div>
          )}

          {activeTab === "overview" && (
            <div className="student-tab-content">
              <div className="student-stat-grid">
                <article>
                  <span>Research submissions</span>
                  <strong>{papers.length}</strong>
                  <small>{publishedCount} published</small>
                </article>
                <article>
                  <span>Awaiting review</span>
                  <strong>{pendingCount}</strong>
                  <small>Reviewer feedback appears here</small>
                </article>
                <article>
                  <span>Saved books</span>
                  <strong>{savedBookIds.length}</strong>
                  <small>Keep helpful reads close</small>
                </article>
                <article>
                  <span>Study notes</span>
                  <strong>{notes.length}</strong>
                  <small>Synced across devices</small>
                </article>
              </div>

              <div className="student-overview-grid">
                <section className="student-panel student-next-step">
                  <div className="student-panel-heading">
                    <div>
                      <p className="student-eyebrow">A GOOD PLACE TO START</p>
                      <h2>Make room for your next idea</h2>
                    </div>
                    <span aria-hidden="true">✦</span>
                  </div>
                  <p>
                    Submit a paper for faculty review, bookmark catalog books, or capture a study note.
                  </p>
                  <div className="student-action-row">
                    <button type="button" className="student-primary-button" onClick={() => setActiveTab("research")}>
                      Share your research
                    </button>
                    <button type="button" className="student-secondary-button" onClick={() => setActiveTab("library")}>
                      Explore saved books
                    </button>
                    <button type="button" className="student-secondary-button" onClick={() => openNote()}>
                      Write a note
                    </button>
                  </div>
                </section>
                <section className="student-panel student-progress-panel">
                  <p className="student-eyebrow">YOUR MOMENTUM</p>
                  <h2>Small steps add up.</h2>
                  <div className="student-progress-track">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          papers.length * 20 + savedBookIds.length * 8 + notes.length * 8
                        )}%`,
                      }}
                    />
                  </div>
                  <p>
                    {papers.length + savedBookIds.length + notes.length} workspace{" "}
                    {papers.length + savedBookIds.length + notes.length === 1 ? "item" : "items"} so far.
                  </p>
                </section>
              </div>

              <section className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">RESEARCH JOURNEY</p>
                    <h2>Latest submissions</h2>
                  </div>
                  <button type="button" className="student-text-button" onClick={() => setActiveTab("research")}>
                    View all →
                  </button>
                </div>
                {papers.length ? (
                  papers.slice(0, 2).map(renderPaperCard)
                ) : (
                  <div className="student-empty-state">
                    <span aria-hidden="true">◇</span>
                    <h3>Your research journey starts here</h3>
                    <p>Share a paper or project and follow its review progress from this workspace.</p>
                    <button type="button" className="student-secondary-button" onClick={() => setActiveTab("research")}>
                      Submit your first paper
                    </button>
                  </div>
                )}
              </section>

              <section className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">CURATED FOR YOU</p>
                    <h2>Continue exploring</h2>
                  </div>
                  <button
                    type="button"
                    className="student-text-button"
                    onClick={() => {
                      window.location.hash = "#library";
                    }}
                  >
                    Browse library →
                  </button>
                </div>
                <div className="student-book-strip">
                  {catalogBooks.slice(0, 3).map((book) => (
                    <article className="student-mini-book" key={book.id}>
                      <img src={book.coverImage || "/ai.jpg"} alt="" />
                      <div>
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <button
                          type="button"
                          className="student-text-button"
                          onClick={() => void toggleSavedBook(book.id)}
                        >
                          {savedBookIds.includes(book.id) ? "✓ Saved" : "＋ Save book"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "research" && (
            <div className="student-tab-content student-research-layout">
              <section className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">SHARE YOUR WORK</p>
                    <h2>Submit research for review</h2>
                  </div>
                  <span className="student-panel-icon" aria-hidden="true">◇</span>
                </div>
                <p className="student-panel-intro">
                  Submit a paper, project, or draft. Approved work is automatically published in the Research Repository.
                </p>
                <form className="student-form" onSubmit={(event) => void handlePaperSubmit(event)}>
                  <label htmlFor="student-paper-title">Paper title</label>
                  <input
                    id="student-paper-title"
                    value={paperForm.title}
                    onChange={(event) => setPaperForm({ ...paperForm, title: event.target.value })}
                    required
                    maxLength={180}
                    placeholder="Give your work a clear, descriptive title"
                  />
                  <div className="student-form-row">
                    <div>
                      <label htmlFor="student-paper-authors">Authors</label>
                      <input
                        id="student-paper-authors"
                        value={paperForm.authors}
                        onChange={(event) => setPaperForm({ ...paperForm, authors: event.target.value })}
                        required
                        maxLength={180}
                        placeholder="You and any collaborators"
                      />
                    </div>
                    <div>
                      <label htmlFor="student-paper-field">Study area</label>
                      <input
                        id="student-paper-field"
                        value={paperForm.field}
                        onChange={(event) => setPaperForm({ ...paperForm, field: event.target.value })}
                        required
                        maxLength={80}
                        placeholder="e.g. Computer science"
                      />
                    </div>
                  </div>
                  <label htmlFor="student-paper-abstract">Abstract or short description</label>
                  <textarea
                    id="student-paper-abstract"
                    value={paperForm.abstract}
                    onChange={(event) => setPaperForm({ ...paperForm, abstract: event.target.value })}
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={5}
                    placeholder="What question does your work explore? What did you learn?"
                  />
                  <label htmlFor="student-paper-file">
                    Research file <span className="student-field-hint">PDF, DOC, or DOCX · up to 20 MB</span>
                  </label>
                  <input
                    id="student-paper-file"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => setPaperFile(event.target.files?.[0] ?? null)}
                    required
                  />
                  {paperFile && (
                    <p className="student-file-selected">
                      Selected: {paperFile.name} · {(paperFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                  <button type="submit" className="student-primary-button" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading submission..." : "Submit for review"}
                  </button>
                </form>
              </section>

              <section className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">SUBMISSION TRACKER</p>
                    <h2>Your papers</h2>
                  </div>
                  <span className="student-count-badge">{papers.length}</span>
                </div>
                <div className="student-review-steps">
                  <span className="is-current">Submitted</span>
                  <i />
                  <span>Under review</span>
                  <i />
                  <span>Published</span>
                </div>
                {papers.length ? (
                  papers.map(renderPaperCard)
                ) : (
                  <div className="student-empty-state">
                    <span aria-hidden="true">⌁</span>
                    <h3>No submissions yet</h3>
                    <p>Every contribution starts with sharing a first draft.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "library" && (
            <section className="student-panel student-tab-content">
              <div className="student-panel-heading">
                <div>
                  <p className="student-eyebrow">YOUR PERSONAL COLLECTION</p>
                  <h2>Saved library</h2>
                </div>
                <a className="student-text-button" href="#library">
                  Browse full catalog →
                </a>
              </div>
              <p className="student-panel-intro">
                Bookmark books from the university catalog, open them in reading mode, or export text summaries for offline study.
              </p>
              <div className="student-book-grid">
                {savedBooks.map((book) => (
                  <article className="student-library-card" key={book.id}>
                    <img src={book.coverImage || "/ai.jpg"} alt="" />
                    <div className="student-library-card-body">
                      <span>{book.category}</span>
                      <h3>{book.title}</h3>
                      <p>
                        By {book.author} · {book.year}
                      </p>
                      <div>
                        <button
                          type="button"
                          className="student-secondary-button"
                          onClick={() => void toggleSavedBook(book.id)}
                        >
                          Remove saved
                        </button>
                        <button
                          type="button"
                          className="student-text-button"
                          onClick={() => downloadBook(book.id)}
                        >
                          Download text
                        </button>
                        <button
                          type="button"
                          className="student-text-button"
                          onClick={() => {
                            window.location.hash = `#reading?id=${book.id}`;
                          }}
                        >
                          Open reader
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!savedBooks.length && (
                <div className="student-empty-state">
                  <span aria-hidden="true">▤</span>
                  <h3>Your saved shelf is waiting</h3>
                  <p>Save a title from the catalog or explore a recommendation from your overview.</p>
                  <a className="student-secondary-button" href="#library">
                    Browse the library
                  </a>
                </div>
              )}
            </section>
          )}

          {activeTab === "notes" && (
            <div className="student-notes-layout student-tab-content">
              <section className="student-panel student-note-editor">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">THINK IT THROUGH</p>
                    <h2>{editingNoteId ? "Edit your note" : "Create a study note"}</h2>
                  </div>
                  <span className="student-panel-icon" aria-hidden="true">✎</span>
                </div>
                <form className="student-form" onSubmit={(e) => void handleSaveNote(e)}>
                  <label htmlFor="student-note-title">Note title</label>
                  <input
                    id="student-note-title"
                    value={noteForm.title}
                    onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })}
                    required
                    maxLength={120}
                    placeholder="A thought worth keeping"
                  />
                  <label htmlFor="student-note-book">Related book (optional)</label>
                  <select
                    id="student-note-book"
                    value={noteForm.bookId}
                    onChange={(event) => setNoteForm({ ...noteForm, bookId: event.target.value })}
                  >
                    <option value="">No book selected</option>
                    {catalogBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="student-note-body">Your note</label>
                  <textarea
                    id="student-note-body"
                    value={noteForm.body}
                    onChange={(event) => setNoteForm({ ...noteForm, body: event.target.value })}
                    required
                    rows={9}
                    maxLength={10000}
                    placeholder="Capture key ideas, questions, or connections..."
                  />
                  <div className="student-action-row">
                    <button type="submit" className="student-primary-button">
                      Save note
                    </button>
                    <button type="button" className="student-secondary-button" onClick={() => openNote()}>
                      New note
                    </button>
                  </div>
                </form>
              </section>

              <section className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <p className="student-eyebrow">YOUR IDEAS</p>
                    <h2>All notes</h2>
                  </div>
                  <span className="student-count-badge">{notes.length}</span>
                </div>
                {notes.length ? (
                  notes.map((note) => {
                    const book = catalogBooks.find((item) => item.id === note.bookId);
                    return (
                      <article
                        className={`student-note-card ${editingNoteId === note.id ? "is-selected" : ""}`}
                        key={note.id}
                      >
                        <button type="button" className="student-note-open" onClick={() => openNote(note)}>
                          <strong>{note.title}</strong>
                          <span>
                            {book?.title ?? "Personal note"} · Updated{" "}
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                          <p>{note.body}</p>
                        </button>
                        <button
                          type="button"
                          className="student-text-button student-delete-note"
                          onClick={() => void handleRemoveNote(note.id)}
                        >
                          Delete
                        </button>
                      </article>
                    );
                  })
                ) : (
                  <div className="student-empty-state">
                    <span aria-hidden="true">✎</span>
                    <h3>A space for your ideas</h3>
                    <p>Keep useful takeaways, questions, and study plans close at hand.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default StudentDashboard;
