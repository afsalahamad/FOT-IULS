import { useEffect, useRef, useState } from "react";
import { friendlyError, streamPost } from "./readerApi";
import type { Chapter, SummaryStyle } from "./types";

interface Props {
  bookId: string;
  chapter: Chapter;
  /** Set by the reader when the user clicks "Explain selection" */
  explain: { text: string; nonce: number } | null;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

const STYLES: { value: SummaryStyle; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "bullets", label: "Bullet points" },
  { value: "detailed", label: "Detailed" },
];

const SUGGESTIONS = [
  "What are the main ideas of this book?",
  "Explain the key terms in this chapter.",
  "What questions does this chapter raise?",
];

export function AiPanel({ bookId, chapter, explain }: Props) {
  const [tab, setTab] = useState<"summary" | "ask">("summary");
  const [style, setStyle] = useState<SummaryStyle>("short");
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [chapterOnly, setChapterOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Stop any running request when the chapter changes or the panel unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, [chapter.id]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const stop = () => abortRef.current?.abort();

  const begin = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError("");
    return controller;
  };

  const finish = (controller: AbortController, e?: unknown) => {
    if (e && (e as Error).name !== "AbortError") setError(friendlyError(e));
    // Ignore late results from a request that was already replaced by a newer one.
    if (abortRef.current === controller) setBusy(false);
  };

  const summarize = async () => {
    const key = `${chapter.id}:${style}`;
    const controller = begin();
    setSummaries((s) => ({ ...s, [key]: "" }));
    try {
      await streamPost(
        "summarize",
        { book_id: bookId, chapter_id: chapter.id, style },
        (tok) => setSummaries((s) => ({ ...s, [key]: (s[key] ?? "") + tok })),
        controller.signal
      );
      finish(controller);
    } catch (e) {
      finish(controller, e);
    }
  };

  const ask = async (q: string, restrictToChapter = chapterOnly) => {
    const text = q.trim();
    if (!text) return;
    const controller = begin();
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: "" }]);
    setQuestion("");
    try {
      await streamPost(
        "ask",
        { book_id: bookId, question: text, chapter_id: restrictToChapter ? chapter.id : null },
        (tok) =>
          setMessages((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, text: x.text + tok } : x))),
        controller.signal
      );
      finish(controller);
    } catch (e) {
      finish(controller, e);
    }
  };

  // "Explain selection" from the reading pane.
  useEffect(() => {
    if (!explain) return;
    setTab("ask");
    void ask(`Explain this passage in simple terms: "${explain.text}"`, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explain?.nonce]);

  const summary = summaries[`${chapter.id}:${style}`];

  return (
    <aside className="rm-ai" aria-label="AI reading assistant">
      <div className="rm-ai__tabs" role="tablist">
        {(["summary", "ask"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className="rm-ai__tab"
            onClick={() => setTab(t)}
          >
            {t === "summary" ? "Summary" : "Ask the book"}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="rm-ai__body" role="tabpanel">
          <p className="rm-ai__context">{chapter.title}</p>

          <div className="rm-ai__row">
            <label className="rm-ai__label">
              Style
              <select value={style} onChange={(e) => setStyle(e.target.value as SummaryStyle)} disabled={busy}>
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="rm-btn rm-btn--primary" onClick={summarize} disabled={busy}>
              {summary ? "Regenerate" : "Summarize this chapter"}
            </button>
            {busy && (
              <button className="rm-btn" onClick={stop}>
                Stop
              </button>
            )}
          </div>

          <div className="rm-ai__output" aria-busy={busy}>
            {summary ? (
              summary
            ) : busy ? (
              "Reading the chapter…"
            ) : (
              <span className="rm-ai__hint">
                Create a summary of this chapter. Summaries are kept while you read, so switching chapters won't lose them.
              </span>
            )}
          </div>
          {error && <p className="rm-ai__error" role="alert">{error}</p>}
        </div>
      )}

      {tab === "ask" && (
        <div className="rm-ai__body rm-ai__body--chat" role="tabpanel">
          <div className="rm-ai__messages" ref={messagesRef}>
            {messages.length === 0 && (
              <div>
                <p className="rm-ai__hint">Ask anything about this book. Answers come only from its text.</p>
                <div className="rm-ai__chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="rm-chip" onClick={() => void ask(s)} disabled={busy}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`rm-msg rm-msg--${m.role}`}>
                {m.text || (busy && i === messages.length - 1 ? "Thinking…" : "")}
              </div>
            ))}
          </div>

          {error && <p className="rm-ai__error" role="alert">{error}</p>}

          <label className="rm-ai__check">
            <input type="checkbox" checked={chapterOnly} onChange={(e) => setChapterOnly(e.target.checked)} />
            This chapter only
          </label>

          <form
            className="rm-ai__ask"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
          >
            <label className="rm-sr" htmlFor="rm-question">
              Your question about the book
            </label>
            <input
              id="rm-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this book…"
              maxLength={1000}
              autoComplete="off"
            />
            {busy ? (
              <button type="button" className="rm-btn" onClick={stop}>
                Stop
              </button>
            ) : (
              <button type="submit" className="rm-btn rm-btn--primary" disabled={!question.trim()}>
                Ask
              </button>
            )}
          </form>
        </div>
      )}

      <p className="rm-ai__note">AI-generated and can be wrong. Check important details in the text.</p>
    </aside>
  );
}
