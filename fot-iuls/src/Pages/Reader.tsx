import { useState, useEffect, useRef } from "react";
import { AiPanel } from "../components/Reader/AiPanel";
import Navigation  from "../components/Navigation"; // Adjust path if needed based on your structure
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

  // Load sample book on start (or accept uploaded books)
  useEffect(() => {
    fetch("http://localhost:8000/api/reader/sample")
      .then((res) => res.json())
      .then((data) => {
        setBookId(data.book_id);
        setBookTitle(data.title);
        setChapters(data.chapters);
      })
      .catch((err) => console.error("Failed to load sample book:", err));
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Navigation Bar with Logo & Profile Status */}
      <Navigation />

      {/* Main Reader Layout */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Side: Chapters & Book Viewer with Highlight Tool */}
        <div className="w-2/3 flex flex-col border-r border-gray-800 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-blue-400">{bookTitle}</h1>
            <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
              Reading Mode active
            </span>
          </div>

          {/* Chapter Selector Tabs */}
          {chapters.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setPopupPos(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    idx === currentChapterIndex
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
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
            className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-xl flex-1 overflow-y-auto leading-relaxed whitespace-pre-wrap text-gray-200 select-text relative shadow-inner"
          >
            {currentChapter ? currentChapter.text : "Loading book content..."}

            {/* Floating Selection Tooltip ("Explain Selection") */}
            {popupPos && (
              <div
                style={{ top: popupPos.y, left: popupPos.x }}
                className="fixed z-50 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 cursor-pointer hover:bg-blue-500 transition-all animate-fade-in"
                onClick={handleExplainClick}
              >
                <span>✨ Explain with AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: AI Summary & Chat Panel */}
        <div className="w-1/3 flex flex-col bg-gray-900/40">
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