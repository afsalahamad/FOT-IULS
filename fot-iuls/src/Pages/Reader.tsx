import { useState, useEffect, useRef } from "react";
import { AiPanel } from "../components/Reader/AiPanel";
import { friendlyError, loadSampleBook, uploadBook } from "../components/Reader/readerApi";
import Navigation from "../components/Navigation";
import type { Chapter } from "../components/Reader/types";

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

  // Highlighting & Explanation state
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
        setPopupPos({
          x: rect.x + rect.width / 2,
          y: Math.max(72, rect.y - 40),
        });
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
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <Navigation />

      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden" }}>
        {/* Left Side: Chapters & Book Viewer with Upload + Highlight Tool */}
        <div style={{ width: "65%", display: "flex", flexDirection: "column", borderRight: "1px solid #1e293b", padding: "24px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa", margin: 0 }}>
              {bookTitle || "Loading Document..."}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={(e) => void handleFileUpload(e)}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  cursor: uploading ? "wait" : "pointer",
                }}
              >
                {uploading ? "Analyzing File..." : "Upload PDF / TXT"}
              </button>
              <button
                type="button"
                onClick={() => void loadSample()}
                disabled={uploading}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                Load Sample
              </button>
            </div>
          </div>

          {statusNotice && (
            <div
              role="status"
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(37, 99, 235, 0.15)",
                border: "1px solid rgba(96, 165, 250, 0.35)",
                color: "#bfdbfe",
                fontSize: "12.5px",
              }}
            >
              {statusNotice}
            </div>
          )}

          {chapters.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "8px" }}>
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setPopupPos(null);
                  }}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: "none",
                    background: idx === currentChapterIndex ? "#2563eb" : "#1e293b",
                    color: idx === currentChapterIndex ? "#ffffff" : "#94a3b8",
                  }}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          )}

          <div
            ref={textContainerRef}
            onMouseUp={handleMouseUp}
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              padding: "28px",
              borderRadius: "12px",
              flex: 1,
              overflowY: "auto",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              color: "#e2e8f0",
              fontSize: "15px",
              position: "relative",
            }}
          >
            {currentChapter ? currentChapter.text : "Loading document content..."}

            {popupPos && (
              <div
                style={{
                  top: popupPos.y,
                  left: popupPos.x,
                  position: "fixed",
                  zIndex: 50,
                  transform: "translateX(-50%)",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                }}
                onClick={handleExplainClick}
              >
                <span>Explain with AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Streaming AI Summary & RAG Chat Panel */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", background: "rgba(15, 23, 42, 0.4)", overflowY: "auto", padding: "16px" }}>
          {bookId && currentChapter && (
            <AiPanel
              key={bookId}
              bookId={bookId}
              chapter={currentChapter}
              explain={explainSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ReaderPage;
