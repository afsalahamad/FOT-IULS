import { useState, useEffect, useRef } from "react";
import { AiPanel } from "../components/Reader/AiPanel";
import Navigation from "../components/Navigation";
import type { Chapter } from "../components/Reader/types";

export function ReaderPage() {
  const [bookId, setBookId] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  
  // Highlighting & Explanation state
  const [explainSelection, setExplainSelection] = useState<{ text: string; nonce: number } | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Load sample book on start (tries port 8001 first, then 8000, then fallback demo)
  useEffect(() => {
    fetch("http://localhost:8001/api/reader/sample")
      .then((res) => {
        if (!res.ok) throw new Error("Port 8001 unreachable");
        return res.json();
      })
      .then((data) => {
        setBookId(data.book_id);
        setBookTitle(data.title);
        setChapters(data.chapters);
      })
      .catch(() => {
        return fetch("http://localhost:8000/api/reader/sample")
          .then((res) => {
            if (!res.ok) throw new Error("Port 8000 unreachable");
            return res.json();
          })
          .then((data) => {
            setBookId(data.book_id);
            setBookTitle(data.title);
            setChapters(data.chapters);
          })
          .catch((err) => {
            console.warn("Backend reader unavailable, using built-in demo:", err);
            setBookId("demo-book");
            setBookTitle("Introduction to Machine Learning (Demo)");
            setChapters([
              {
                id: 1,
                title: "Chapter 1: The Machine Learning Landscape",
                text: "When most people hear Machine Learning, they picture a robot: a dependable butler or a deadly Terminator depending on who you ask. But Machine Learning is not just a futuristic fantasy, it is already here. In fact, it has been around for decades in specialized applications like optical character recognition.\n\nMachine Learning is the science (and art) of programming computers so they can learn from data. Machine Learning is great for problems for which existing solutions require a lot of fine-tuning or long lists of rules."
              },
              {
                id: 2,
                title: "Chapter 2: Supervised vs Unsupervised Learning",
                text: "In supervised learning, the training data you feed to the algorithm includes the desired solutions, called labels. A typical supervised learning task is classification: a spam filter is trained with many example emails along with their class (spam or ham), and it must learn how to classify new emails.\n\nIn unsupervised learning, on the other hand, the training data is unlabeled. The system tries to learn without a teacher."
              }
            ]);
          });
      });
  }, []);

  const currentChapter = chapters[currentChapterIndex];

  // Handle text selection for highlighting / explaining
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
          y: rect.y - 40,
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
      {/* Top Navigation Bar with Logo & Profile Status */}
      <Navigation />

      {/* Main Reader Layout */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden" }}>
        
        {/* Left Side: Chapters & Book Viewer with Highlight Tool */}
        <div style={{ width: "65%", display: "flex", flexDirection: "column", borderRight: "1px solid #1e293b", padding: "24px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa", margin: 0 }}>{bookTitle || "Loading Book..."}</h1>
            <span style={{ fontSize: "12px", background: "#1e293b", color: "#cbd5e1", padding: "4px 12px", borderRadius: "14px", border: "1px solid #334155" }}>
              Reading Mode active
            </span>
          </div>

          {/* Chapter Selector Tabs */}
          {chapters.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "8px" }}>
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
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
                    color: idx === currentChapterIndex ? "#ffffff" : "#94a3b8"
                  }}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          )}

          {/* Book Content Pane */}
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
              position: "relative"
            }}
          >
            {currentChapter ? currentChapter.text : "Loading book content..."}

            {/* Floating Selection Tooltip ("Explain Selection") */}
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
                  cursor: "pointer"
                }}
                onClick={handleExplainClick}
              >
                <span>Explain with AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: AI Summary & Chat Panel */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", background: "rgba(15, 23, 42, 0.4)", overflowY: "auto", padding: "16px" }}>
          {bookId && currentChapter && (
            <AiPanel
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
