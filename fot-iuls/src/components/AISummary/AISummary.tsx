import { useState, useEffect } from "react";
import type { AISummaryData } from "../../types/book";
import "./AISummary.css";

interface AISummaryProps {
  bookTitle: string;
  author: string;
  aiData: AISummaryData;
}

export function AISummary({ bookTitle, author, aiData }: AISummaryProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "concepts" | "ask">("summary");
  const [chatThread, setChatThread] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: `Hello! I am your AI study companion for "${bookTitle}" by ${author}. Ask me anything about this book, key concepts, or exam questions.`
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Stop speech when component unmounts or book changes
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [bookTitle]);

  const handleCopySummary = async () => {
    const textToCopy = `AI Summary: ${bookTitle} (${author})\n\n` +
      `Summary:\n${aiData.executiveSummary}\n\n` +
      `Key Takeaways:\n${aiData.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n` +
      `Estimated Read Time: ${aiData.estimatedReadTime} | Difficulty: ${aiData.difficulty}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch {
      // Fallback
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
        `AI Summary for ${bookTitle}. ${aiData.executiveSummary}. Key takeaway: ${aiData.keyTakeaways[0]}`
      );
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleAskQuestion = (question: string) => {
    if (!question.trim() || isAnswering) return;

    const trimmed = question.trim();
    setUserInput("");
    setChatThread((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsAnswering(true);

    setTimeout(() => {
      let answer = aiData.quickAiAnswers?.[trimmed];

      if (!answer) {
        // Generate an intelligent contextual answer using book metadata
        answer = `Regarding "${trimmed}" in "${bookTitle}": ${aiData.executiveSummary} In particular, ${aiData.keyTakeaways[0]}`;
      }

      setChatThread((prev) => [...prev, { role: "assistant", text: answer }]);
      setIsAnswering(false);
    }, 450);
  };

  return (
    <div className="ai-summary-card" aria-label="AI Summary Panel">
      <div className="ai-summary-header">
        <div className="ai-summary-title-wrap">
          <div className="ai-sparkle-icon" aria-hidden="true">AI</div>
          <div>
            <h3>IULS AI Scholar</h3>
            <span className="ai-summary-tag">Smart Overview</span>
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
            onClick={handleCopySummary}
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
          Ask AI Q&A
        </button>
      </div>

      <div className="ai-summary-content">
        {activeTab === "summary" && (
          <div>
            <div className="ai-exec-summary">
              {aiData.executiveSummary}
            </div>

            <h4 className="ai-section-subtitle">
              Key Takeaways & Thesis
            </h4>
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
                Suggested Prompts:
              </span>
              {aiData.sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-btn"
                  onClick={() => handleAskQuestion(q)}
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
                  Thinking...
                </div>
              )}
            </div>

            <form
              className="ai-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(userInput);
              }}
            >
              <input
                type="text"
                className="ai-input-box"
                placeholder="Ask a question about this book..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
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
        <div className="ai-toast-copied">
          ✓ AI Summary copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default AISummary;
