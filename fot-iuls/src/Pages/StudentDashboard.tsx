import { useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import logo from '../assets/logo.png';
import Footer from "../components/Footer";
import { INITIAL_BOOKS } from "../data/booksData";
import {
  deletePaperAttachment,
  downloadBookText,
  downloadPaperAttachment,
  getSavedBookIds,
  getStudentNotes,
  getStudentPapers,
  savePaperAttachment,
  saveSavedBookIds,
  saveStudentNotes,
  saveStudentPapers,
  type StudentNote,
  type StudentPaper,
} from "../data/studentWorkspace";
import "./StudentDashboard.css";

type DashboardTab = "overview" | "research" | "library" | "notes";

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "research", label: "My research", icon: "◇" },
  { id: "library", label: "Saved library", icon: "▤" },
  { id: "notes", label: "Notes", icon: "✎" },
];

function readInitialWorkspace() {
  try {
    return {
      papers: getStudentPapers(),
      notes: getStudentNotes(),
      savedBookIds: getSavedBookIds(),
      error: "",
    };
  } catch (error) {
    return {
      papers: [],
      notes: [],
      savedBookIds: [],
      error: error instanceof Error ? error.message : "Could not load saved student workspace data.",
    };
  }
}

export function StudentDashboard({ profileName = "Scholar" }: { profileName?: string }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [initialWorkspace] = useState(readInitialWorkspace);
  const [papers, setPapers] = useState(initialWorkspace.papers);
  const [notes, setNotes] = useState(initialWorkspace.notes);
  const [savedBookIds, setSavedBookIds] = useState(initialWorkspace.savedBookIds);
  const [workspaceError, setWorkspaceError] = useState(initialWorkspace.error);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paperForm, setPaperForm] = useState({ title: "", authors: "", field: "", abstract: "" });
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", bookId: "", body: "" });

  const savedBooks = useMemo(
    () => INITIAL_BOOKS.filter((book) => savedBookIds.includes(book.id)),
    [savedBookIds],
  );
  const pendingCount = papers.filter((paper) => paper.status === "pending").length;
  const publishedCount = papers.filter((paper) => paper.status === "approved").length;
  const welcomeName = profileName.split(/\s+/)[0] || "Scholar";

  const toggleSavedBook = (bookId: string) => {
    const updated = savedBookIds.includes(bookId)
      ? savedBookIds.filter((id) => id !== bookId)
      : [...savedBookIds, bookId];
    try {
      saveSavedBookIds(updated);
      setSavedBookIds(updated);
      setNotice(updated.includes(bookId) ? "Book saved to your library." : "Book removed from your saved library.");
      setWorkspaceError("");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not update your saved library.");
    }
  };

  const handlePaperSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    const paper: StudentPaper = {
      id: `paper-${crypto.randomUUID()}`,
      ...paperForm,
      fileName: paperFile.name,
      submittedAt: new Date().toISOString(),
      status: "pending",
      reviewerNote: "",
    };

    setIsSubmitting(true);
    try {
      await savePaperAttachment(paper.id, paperFile);
      const updated = [paper, ...papers];
      try {
        saveStudentPapers(updated);
      } catch (error) {
        await deletePaperAttachment(paper.id);
        throw error;
      }
      setPapers(updated);
      setPaperForm({ title: "", authors: "", field: "", abstract: "" });
      setPaperFile(null);
      const fileInput = document.getElementById("student-paper-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setWorkspaceError("");
      setNotice("Your paper was submitted to the review queue.");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not save your research submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadBook = (bookId: string) => {
    const book = INITIAL_BOOKS.find((item) => item.id === bookId);
    if (!book) return;
    downloadBookText(book);
    setNotice("Available book text downloaded.");
  };

  const openNote = (note?: StudentNote) => {
    setEditingNoteId(note?.id ?? null);
    setNoteForm(note
      ? { title: note.title, bookId: note.bookId, body: note.body }
      : { title: "", bookId: "", body: "" });
    setActiveTab("notes");
  };

  const saveNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note: StudentNote = {
      id: editingNoteId ?? `note-${crypto.randomUUID()}`,
      ...noteForm,
      updatedAt: new Date().toISOString(),
    };
    const updated = [note, ...notes.filter((item) => item.id !== note.id)];
    try {
      saveStudentNotes(updated);
      setNotes(updated);
      setEditingNoteId(note.id);
      setWorkspaceError("");
      setNotice("Your note was saved.");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not save your note.");
    }
  };

  const removeNote = (noteId: string) => {
    const updated = notes.filter((note) => note.id !== noteId);
    try {
      saveStudentNotes(updated);
      setNotes(updated);
      if (editingNoteId === noteId) openNote();
      setWorkspaceError("");
      setNotice("Note deleted.");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not delete your note.");
    }
  };

  const handleAttachmentDownload = async (paper: StudentPaper) => {
    try {
      await downloadPaperAttachment(paper);
      setWorkspaceError("");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not download the uploaded paper.");
    }
  };

  const renderPaperCard = (paper: StudentPaper) => (
    <article className="student-paper-card" key={paper.id}>
      <div className="student-paper-card-heading">
        <div>
          <span className={`student-status student-status--${paper.status}`}>
            {paper.status === "approved" ? "Published" : paper.status === "revision" ? "Revision requested" : "In review"}
          </span>
          <h3>{paper.title}</h3>
        </div>
        <button type="button" className="student-text-button" onClick={() => void handleAttachmentDownload(paper)}>
          Download file
        </button>
      </div>
      <p className="student-paper-meta">{paper.authors} · {paper.field} · {new Date(paper.submittedAt).toLocaleDateString()}</p>
      <p className="student-paper-abstract">{paper.abstract}</p>
      {paper.reviewerNote && <p className="student-review-note"><strong>Reviewer feedback:</strong> {paper.reviewerNote}</p>}
      {paper.status === "approved" && <a className="student-text-button" href="#research">View in Research Repository →</a>}
      {paper.status === "revision" && (
        <button type="button" className="student-secondary-button" onClick={() => {
          setPaperForm({ title: paper.title, authors: paper.authors, field: paper.field, abstract: paper.abstract });
          setPaperFile(null);
          setActiveTab("research");
        }}>
          Prepare a revised submission
        </button>
      )}
    </article>
  );

  return (
    <div className="student-page">
      <Navigation profileName={profileName} />
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
              <p>A welcoming space for your reading, research, and next big idea.</p>
            </div>
            <button type="button" className="student-primary-button" onClick={() => { setActiveTab("research"); document.getElementById("student-paper-title")?.focus(); }}>
              <span aria-hidden="true">＋</span> Submit research
            </button>
          </header>

          {(workspaceError || notice) && (
            <div className={`student-alert ${workspaceError ? "student-alert--error" : ""}`} role={workspaceError ? "alert" : "status"}>
              <span>{workspaceError || notice}</span>
              <button type="button" onClick={() => { setWorkspaceError(""); setNotice(""); }} aria-label="Dismiss message">×</button>
            </div>
          )}

          <div className="student-local-note">
            This prototype keeps submissions, notes, and saved books in this browser only. It does not upload files to a university server.
          </div>

          {activeTab === "overview" && (
            <div className="student-tab-content">
              <div className="student-stat-grid">
                <article><span>Research submissions</span><strong>{papers.length}</strong><small>{publishedCount} published</small></article>
                <article><span>Awaiting review</span><strong>{pendingCount}</strong><small>We’ll show reviewer feedback here</small></article>
                <article><span>Saved books</span><strong>{savedBookIds.length}</strong><small>Keep helpful reads close</small></article>
                <article><span>Study notes</span><strong>{notes.length}</strong><small>Your ideas, all in one place</small></article>
              </div>

              <div className="student-overview-grid">
                <section className="student-panel student-next-step">
                  <div className="student-panel-heading"><div><p className="student-eyebrow">A GOOD PLACE TO START</p><h2>Make room for your next idea</h2></div><span aria-hidden="true">✦</span></div>
                  <p>Submit a paper for review, collect useful books, or capture a thought before it gets away.</p>
                  <div className="student-action-row">
                    <button type="button" className="student-primary-button" onClick={() => setActiveTab("research")}>Share your research</button>
                    <button type="button" className="student-secondary-button" onClick={() => setActiveTab("library")}>Explore books</button>
                    <button type="button" className="student-secondary-button" onClick={() => openNote()}>Write a note</button>
                  </div>
                </section>
                <section className="student-panel student-progress-panel">
                  <p className="student-eyebrow">YOUR MOMENTUM</p>
                  <h2>Small steps add up.</h2>
                  <div className="student-progress-track"><span style={{ width: `${Math.min(100, papers.length * 20 + savedBookIds.length * 8 + notes.length * 8)}%` }} /></div>
                  <p>{papers.length + savedBookIds.length + notes.length} workspace {papers.length + savedBookIds.length + notes.length === 1 ? "item" : "items"} so far. Keep building at your own pace.</p>
                </section>
              </div>

              <section className="student-panel">
                <div className="student-panel-heading"><div><p className="student-eyebrow">RESEARCH JOURNEY</p><h2>Latest submissions</h2></div><button type="button" className="student-text-button" onClick={() => setActiveTab("research")}>View all →</button></div>
                {papers.length ? papers.slice(0, 2).map(renderPaperCard) : (
                  <div className="student-empty-state"><span aria-hidden="true">◇</span><h3>Your research journey starts here</h3><p>Share a paper or project and follow its review progress from this workspace.</p><button type="button" className="student-secondary-button" onClick={() => setActiveTab("research")}>Submit your first paper</button></div>
                )}
              </section>

              <section className="student-panel">
                <div className="student-panel-heading"><div><p className="student-eyebrow">CURATED FOR YOU</p><h2>Continue exploring</h2></div><button type="button" className="student-text-button" onClick={() => { window.location.hash = "#library"; }}>Browse library →</button></div>
                <div className="student-book-strip">
                  {INITIAL_BOOKS.slice(0, 3).map((book) => (
                    <article className="student-mini-book" key={book.id}>
                      <img src={book.coverImage || "/ai.jpg"} alt="" />
                      <div><h3>{book.title}</h3><p>{book.author}</p>
                        <button type="button" className="student-text-button" onClick={() => toggleSavedBook(book.id)}>
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
                <div className="student-panel-heading"><div><p className="student-eyebrow">SHARE YOUR WORK</p><h2>Submit research for review</h2></div><span className="student-panel-icon" aria-hidden="true">◇</span></div>
                <p className="student-panel-intro">Submit a paper, project, or early-stage idea. Approved work appears in the Research Repository. You can revise and resubmit after feedback.</p>
                <form className="student-form" onSubmit={(event) => void handlePaperSubmit(event)}>
                  <label htmlFor="student-paper-title">Paper title</label>
                  <input id="student-paper-title" value={paperForm.title} onChange={(event) => setPaperForm({ ...paperForm, title: event.target.value })} required maxLength={180} placeholder="Give your work a clear, descriptive title" />
                  <div className="student-form-row">
                    <div><label htmlFor="student-paper-authors">Authors</label><input id="student-paper-authors" value={paperForm.authors} onChange={(event) => setPaperForm({ ...paperForm, authors: event.target.value })} required maxLength={180} placeholder="You and any collaborators" /></div>
                    <div><label htmlFor="student-paper-field">Study area</label><input id="student-paper-field" value={paperForm.field} onChange={(event) => setPaperForm({ ...paperForm, field: event.target.value })} required maxLength={80} placeholder="e.g. Computer science" /></div>
                  </div>
                  <label htmlFor="student-paper-abstract">Abstract or short description</label>
                  <textarea id="student-paper-abstract" value={paperForm.abstract} onChange={(event) => setPaperForm({ ...paperForm, abstract: event.target.value })} required minLength={30} maxLength={3000} rows={5} placeholder="What question does your work explore? What did you learn?" />
                  <label htmlFor="student-paper-file">Research file <span className="student-field-hint">PDF, DOC, or DOCX · up to 20 MB</span></label>
                  <input id="student-paper-file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setPaperFile(event.target.files?.[0] ?? null)} required />
                  {paperFile && <p className="student-file-selected">Selected: {paperFile.name} · {(paperFile.size / 1024 / 1024).toFixed(1)} MB</p>}
                  <button type="submit" className="student-primary-button" disabled={isSubmitting}>{isSubmitting ? "Saving submission…" : "Submit for review"}</button>
                </form>
              </section>
              <section className="student-panel">
                <div className="student-panel-heading"><div><p className="student-eyebrow">SUBMISSION TRACKER</p><h2>Your papers</h2></div><span className="student-count-badge">{papers.length}</span></div>
                <div className="student-review-steps"><span className="is-current">Submitted</span><i /><span>Under review</span><i /><span>Published</span></div>
                {papers.length ? papers.map(renderPaperCard) : <div className="student-empty-state"><span aria-hidden="true">⌁</span><h3>No submissions yet</h3><p>Every contribution starts with sharing a first draft.</p></div>}
              </section>
            </div>
          )}

          {activeTab === "library" && (
            <section className="student-panel student-tab-content">
              <div className="student-panel-heading"><div><p className="student-eyebrow">YOUR PERSONAL COLLECTION</p><h2>Saved library</h2></div><a className="student-text-button" href="#library">Browse full catalog →</a></div>
              <p className="student-panel-intro">Save books for later. Download a text copy of the reading content available in this demo catalog.</p>
              <div className="student-book-grid">
                {savedBooks.map((book) => (
                    <article className="student-library-card" key={book.id}>
                      <img src={book.coverImage || "/ai.jpg"} alt="" />
                      <div className="student-library-card-body"><span>{book.category}</span><h3>{book.title}</h3><p>By {book.author} · {book.year}</p>
                        <div><button type="button" className="student-secondary-button" onClick={() => toggleSavedBook(book.id)}>Remove saved</button>
                          <button type="button" className="student-text-button" onClick={() => downloadBook(book.id)}>Download text</button>
                          <button type="button" className="student-text-button" onClick={() => { window.location.hash = `#reading?id=${book.id}`; }}>Open reader</button>
                        </div>
                      </div>
                    </article>
                ))}
              </div>
              {!savedBooks.length && <div className="student-empty-state"><span aria-hidden="true">▤</span><h3>Your saved shelf is waiting</h3><p>Save a title from the catalog or explore a recommendation from your overview.</p><a className="student-secondary-button" href="#library">Browse the library</a></div>}
            </section>
          )}

          {activeTab === "notes" && (
            <div className="student-notes-layout student-tab-content">
              <section className="student-panel student-note-editor">
                <div className="student-panel-heading"><div><p className="student-eyebrow">THINK IT THROUGH</p><h2>{editingNoteId ? "Edit your note" : "Create a study note"}</h2></div><span className="student-panel-icon" aria-hidden="true">✎</span></div>
                <form className="student-form" onSubmit={saveNote}>
                  <label htmlFor="student-note-title">Note title</label>
                  <input id="student-note-title" value={noteForm.title} onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })} required maxLength={120} placeholder="A thought worth keeping" />
                  <label htmlFor="student-note-book">Related book (optional)</label>
                  <select id="student-note-book" value={noteForm.bookId} onChange={(event) => setNoteForm({ ...noteForm, bookId: event.target.value })}>
                    <option value="">No book selected</option>
                    {INITIAL_BOOKS.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
                  </select>
                  <label htmlFor="student-note-body">Your note</label>
                  <textarea id="student-note-body" value={noteForm.body} onChange={(event) => setNoteForm({ ...noteForm, body: event.target.value })} required rows={9} maxLength={10000} placeholder="Capture key ideas, questions, or connections…" />
                  <div className="student-action-row"><button type="submit" className="student-primary-button">Save note</button><button type="button" className="student-secondary-button" onClick={() => openNote()}>New note</button></div>
                </form>
              </section>
              <section className="student-panel">
                <div className="student-panel-heading"><div><p className="student-eyebrow">YOUR IDEAS</p><h2>All notes</h2></div><span className="student-count-badge">{notes.length}</span></div>
                {notes.length ? notes.map((note) => {
                  const book = INITIAL_BOOKS.find((item) => item.id === note.bookId);
                  return <article className={`student-note-card ${editingNoteId === note.id ? "is-selected" : ""}`} key={note.id}>
                    <button type="button" className="student-note-open" onClick={() => openNote(note)}><strong>{note.title}</strong><span>{book?.title ?? "Personal note"} · Updated {new Date(note.updatedAt).toLocaleDateString()}</span><p>{note.body}</p></button>
                    <button type="button" className="student-text-button student-delete-note" onClick={() => removeNote(note.id)}>Delete</button>
                  </article>;
                }) : <div className="student-empty-state"><span aria-hidden="true">✎</span><h3>A space for your ideas</h3><p>Keep useful takeaways, questions, and study plans close at hand.</p></div>}
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
