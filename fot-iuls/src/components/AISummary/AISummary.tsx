import { useState, useEffect } from "react";
import type { AISummaryData } from "../../types/book";
import "./AISummary.css";

interface AISummaryProps {
  bookId?: string;
  bookTitle: string;
  author: string;
  abstract?: string;
  chapterTitle?: string;
  chapterText?: string;
  aiData: AISummaryData;
}

interface ThreadMessage {
  role: "user" | "assistant";
  text: string;
}

function initialGreeting(bookTitle: string, author: string): ThreadMessage {
  return {
    role: "assistant",
    text: `Hello! I am your live AI study companion for "${bookTitle}" by ${author}. Ask me anything about this chapter, key concepts, or exam questions.`,
  };
}

export function AISummary({
  bookId = "",
  bookTitle,
  author,
  abstract = "",
  chapterTitle = "",
  chapterText = "",
  aiData,
}: AISummaryProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "concepts" | "ask">("summary");
  const [chatThread, setChatThread] = useState<ThreadMessage[]>([
    initialGreeting(bookTitle, author),
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [aiSourceLabel, setAiSourceLabel] = useState<"Live AI" | "Offline Overview">("Live AI");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Stop TTS when component unmounts or active book changes
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [bookId]);

  const handleCopySummary = async () => {
    const textToCopy =
      `AI Summary: ${bookTitle} (${author})\n\n` +
      `Summary:\n${aiData.executiveSummary}\n\n` +
      `Key Takeaways:\n${aiData.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n` +
      `Estimated Read Time: ${aiData.estimatedReadTime} | Difficulty: ${aiData.difficulty}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `AI Summary for ${bookTitle}. ${aiData.executiveSummary}. Key takeaway: ${aiData.keyTakeaways[0] ?? ""}`
      );
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleAskQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isAnswering) return;

    const priorHistory = chatThread.slice(1).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      text: m.text,
    }));

    setUserInput("");
    setChatThread((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsAnswering(true);

    try {
      const res = await fetch("/api/assistant/book-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: bookId,
          title: bookTitle,
          author,
          abstract: abstract || aiData.executiveSummary,
          chapter_title: chapterTitle,
          chapter_text: chapterText,
          question: trimmed,
          history: priorHistory.slice(-6),
        }),
      });

      if (res.ok) {
        const data: { reply?: string } = await res.json();
        if (data.reply) {
          setAiSourceLabel("Live AI");
          setChatThread((prev) => [...prev, { role: "assistant", text: data.reply! }]);
          setIsAnswering(false);
          return;
        }
      }
      throw new Error("Live AI unavailable");
    } catch {
      setAiSourceLabel("Offline Overview");
      const fallbackAnswer =
        aiData.quickAiAnswers?.[trimmed] ||
        `[Offline fallback] Regarding "${trimmed}" in "${bookTitle}": ${aiData.executiveSummary}${
          aiData.keyTakeaways[0] ? ` Key takeaway: ${aiData.keyTakeaways[0]}` : ""
        }`;
      setChatThread((prev) => [...prev, { role: "assistant", text: fallbackAnswer }]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="ai-summary-card" aria-label="AI Summary Panel">
      <div className="ai-summary-header">
        <div className="ai-summary-title-wrap">
          <div className="ai-sparkle-icon" aria-hidden="true">AI</div>
          <div>
            <h3>IULS AI Scholar</h3>
            <span className="ai-summary-tag">{aiSourceLabel}</span>
          </div>
        </div>

        <div className="ai-header-actions">
          <button
            type="button"
            className="ai-header-btn"
            onClick={handleToggleSpeech}
            title={isPlayingAudio ? "Pause Audio" : "Listen to AI Briefing"}
          >
            {isPlayingAudio ? "Stop Audio" : "Listen"}
          </button>
          <button
            type="button"
            className="ai-header-btn"
            onClick={() => void handleCopySummary()}
            title="Copy AI Summary to Clipboard"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="ai-meta-bar">
        <div className="ai-meta-item">
          <span>Read Time:</span>
          <strong>{aiData.estimatedReadTime}</strong>
        </div>
        <div className="ai-meta-item">
          <span>Level:</span>
          <span className={`difficulty-pill ${aiData.difficulty}`}>{aiData.difficulty}</span>
        </div>
        <div className="ai-meta-item">
          <span>Audience:</span>
          <span>{aiData.targetAudience}</span>
        </div>
      </div>

      <div className="ai-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "summary"}
          className={`ai-tab-button ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Executive Summary
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "concepts"}
          className={`ai-tab-button ${activeTab === "concepts" ? "active" : ""}`}
          onClick={() => setActiveTab("concepts")}
        >
          Core Concepts ({aiData.coreConcepts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ask"}
          className={`ai-tab-button ${activeTab === "ask" ? "active" : ""}`}
          onClick={() => setActiveTab("ask")}
        >
          Ask AI Q&amp;A
        </button>
      </div>

      <div className="ai-summary-content">
        {activeTab === "summary" && (
          <div>
            <div className="ai-exec-summary">{aiData.executiveSummary}</div>

            <h4 className="ai-section-subtitle">Key Takeaways &amp; Thesis</h4>
            <ul className="ai-takeaways-list">
              {aiData.keyTakeaways.map((point, index) => (
                <li key={index} className="ai-takeaway-item">
                  <span className="ai-check-icon">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "concepts" && (
          <div className="ai-concepts-grid">
            {aiData.coreConcepts.map((item, idx) => (
              <div key={idx} className="ai-concept-card">
                <div className="ai-concept-term">{item.term}</div>
                <p className="ai-concept-exp">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "ask" && (
          <div className="ai-interactive-panel">
            <div className="ai-quick-prompts">
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                Suggested Prompts{chapterTitle ? ` (${chapterTitle})` : ""}:
              </span>
              {aiData.sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-btn"
                  disabled={isAnswering}
                  onClick={() => void handleAskQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="ai-chat-thread">
              {chatThread.map((msg, i) => (
                <div key={i} className={`ai-message ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isAnswering && (
                <div className="ai-message assistant" style={{ fontStyle: "italic", color: "#64748b" }}>
                  Analyzing chapter...
                </div>
              )}
            </div>

            <form
              className="ai-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                void handleAskQuestion(userInput);
              }}
            >
              <input
                type="text"
                className="ai-input-box"
                placeholder="Ask a question about this book or chapter..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAnswering}
              />
              <button
                type="submit"
                className="ai-submit-btn"
                disabled={isAnswering || !userInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {copiedNotification && (
        <div className="ai-toast-copied">✓ AI Summary copied to clipboard!</div>
      )}
    </div>
  );
}

export default AISummary;
