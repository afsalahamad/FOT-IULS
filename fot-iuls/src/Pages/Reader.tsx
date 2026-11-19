import { useState, useEffect, useRef } from "react";
import { AiPanel } from "../components/Reader/AiPanel";
import { friendlyError, loadSampleBook, uploadBook } from "../components/Reader/readerApi";
import Navigation from "../components/Navigation";
import type { Chapter } from "../components/Reader/types";
import "./Reader.css";

const DEMO_CHAPTERS: Chapter[] = [
  {
    id: 0,
    title: "Chapter 1: The Machine Learning Landscape",
    text: "When most people hear Machine Learning, they picture a robot: a dependable butler or a deadly Terminator depending on who you ask. But Machine Learning is not just a futuristic fantasy, it is already here. In fact, it has been around for decades in specialized applications like optical character recognition.\n\nMachine Learning is the science (and art) of programming computers so they can learn from data. Machine Learning is great for problems for which existing solutions require a lot of fine-tuning or long lists of rules.",
  },
  {
    id: 1,
    title: "Chapter 2: Supervised vs Unsupervised Learning",
    text: "In supervised learning, the training data you feed to the algorithm includes the desired solutions, called labels. A typical supervised learning task is classification: a spam filter is trained with many example emails along with their class (spam or ham), and it must learn how to classify new emails.\n\nIn unsupervised learning, on the other hand, the training data is unlabeled. The system tries to learn without a teacher.",
  },
];

export function ReaderPage() {
  const [bookId, setBookId] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string>("");

  const [explainSelection, setExplainSelection] = useState<{ text: string; nonce: number } | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  const textContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applySampleResult = (data: { book_id: string; title: string; chapters: Chapter[] }) => {
    setBookId(data.book_id);
    setBookTitle(data.title);
    setChapters(data.chapters);
    setCurrentChapterIndex(0);
    setStatusNotice("");
  };

  const applyOfflineFallback = () => {
    setBookId("demo-book");
    setBookTitle("Introduction to Machine Learning (Offline Demo)");
    setChapters(DEMO_CHAPTERS);
    setCurrentChapterIndex(0);
    setStatusNotice("Backend reader server is offline. Showing built-in demo text.");
  };

  const loadSample = async () => {
    try {
      const data = await loadSampleBook();
      applySampleResult(data);
    } catch {
      applyOfflineFallback();
    }
  };

  useEffect(() => {
    let active = true;
    loadSampleBook()
      .then((data) => {
        if (active) applySampleResult(data);
      })
      .catch(() => {
        if (active) applyOfflineFallback();
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusNotice("");
    setPopupPos(null);

    try {
      const data = await uploadBook(file);
      setBookId(data.book_id);
      setBookTitle(data.title);
      setChapters(data.chapters);
      setCurrentChapterIndex(0);
      setStatusNotice(`Loaded "${data.title}" (${data.chapters.length} sections).`);
    } catch (err) {
      setStatusNotice(friendlyError(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 2) {
      setSelectedText(text);
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const clampedX = Math.min(Math.max(rect.x + rect.width / 2, 80), window.innerWidth - 80);
        const clampedY = Math.max(76, rect.y - 42);
        setPopupPos({ x: clampedX, y: clampedY });
      }
    } else {
      setPopupPos(null);
    }
  };

  const handleExplainClick = () => {
    if (!selectedText) return;
    setExplainSelection({ text: selectedText, nonce: Date.now() });
    setPopupPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="reader-shell">
      <Navigation />

      <div className="reader-workspace">
        <section className="reader-document-pane" aria-label="Document Reader">
          <div className="reader-doc-header">
            <h1 className="reader-doc-title">{bookTitle || "Loading Document..."}</h1>

            <div className="reader-doc-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={(e) => void handleFileUpload(e)}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="reader-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Analyzing File..." : "Upload PDF / TXT"}
              </button>
              <button
                type="button"
                className="reader-sample-btn"
                onClick={() => void loadSample()}
                disabled={uploading}
              >
                Load Sample
              </button>
            </div>
          </div>

          {statusNotice && (
            <div role="status" className="reader-status-banner">
              {statusNotice}
            </div>
          )}

          {chapters.length > 0 && (
            <div className="reader-chapters-strip" role="tablist" aria-label="Document sections">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentChapterIndex}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setPopupPos(null);
                  }}
                  className={`reader-chapter-tab ${idx === currentChapterIndex ? "is-active" : ""}`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          )}

          <div ref={textContainerRef} onMouseUp={handleMouseUp} className="reader-text-surface">
            {currentChapter ? currentChapter.text : "Loading document content..."}

            {popupPos && (
              <button
                type="button"
                className="reader-explain-tooltip"
                style={{ top: popupPos.y, left: popupPos.x }}
                onClick={handleExplainClick}
              >
                Explain with AI
              </button>
            )}
          </div>
        </section>

        <aside className="reader-ai-sidebar" aria-label="AI Document Assistant">
          {bookId && currentChapter && (
            <AiPanel
              key={bookId}
              bookId={bookId}
              chapter={currentChapter}
              explain={explainSelection}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default ReaderPage;
