import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, QuickPrompt } from './types';
import { sendChatMessage } from './assistantApi';
import logoTransparent from '../../assets/logo-transparent.png';
import './AIAssistant.css';

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'qp-1',
    label: 'Deep Learning Books',
    prompt: 'Can you recommend books from the library to learn Deep Learning?',
    category: 'books',
  },
  {
    id: 'qp-2',
    label: 'Explain Big O',
    prompt: 'Explain Time Complexity and Big O notation with a simple example.',
    category: 'doubts',
  },
  {
    id: 'qp-3',
    label: 'Exam Motivation',
    prompt: 'I feel overwhelmed preparing for semester exams. Can you give me some practical study advice and motivation?',
    category: 'motivation',
  },
  {
    id: 'qp-4',
    label: 'Thesis Abstract',
    prompt: 'How do I structure a strong abstract for an academic research paper?',
    category: 'research',
  },
];

let msgSeq = 0;
const generateMsgId = (prefix: string) => `${prefix}-${Date.now()}-${++msgSeq}`;
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init',
  role: 'assistant',
  text: 'Welcome to IULS Scholar AI. I am your academic assistant and study mentor for the Faculty of Technology. You can ask me to clear academic doubts, recommend textbooks from the library catalog, or provide study motivation and guidance. How can I support your learning today?',
  timestamp: getFormattedTime(),
};

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('iuls_assistant_chat');
      return saved ? JSON.parse(saved) : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('iuls_assistant_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not persist assistant chat to session:', e);
    }
  }, [messages]);

  // Auto-scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateMsgId('usr'),
      role: 'user',
      text,
      timestamp: getFormattedTime(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send prior conversation turns only; backend appends the new user message.
      const historyPayload = messages
        .filter((m) => m.id !== 'msg-init')
        .map((m) => ({ role: m.role, text: m.text }));

      const replyText = await sendChatMessage(text, historyPayload);

      const botMsg: ChatMessage = {
        id: generateMsgId('bot'),
        role: 'assistant',
        text: replyText,
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: generateMsgId('err'),
        role: 'assistant',
        text: err?.message || 'Sorry, I encountered a temporary connection error. Please try again.',
        timestamp: getFormattedTime(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history with Scholar AI?')) {
      setMessages([INITIAL_GREETING]);
      sessionStorage.removeItem('iuls_assistant_chat');
    }
  };

  // Helper to render markdown links, bold text, and clean paragraphs
  const renderFormattedText = (rawText: string) => {
    // Regex for markdown links: [Label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderSimpleMarkdown(rawText.substring(lastIndex, match.index)));
      }

      const label = match[1];
      const url = match[2];

      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          className="assistant-book-link"
          onClick={(e) => {
            if (url.startsWith('#')) {
              e.preventDefault();
              window.location.hash = url;
            }
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          {label}
        </a>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(renderSimpleMarkdown(rawText.substring(lastIndex)));
    }

    return parts;
  };

  // Helper to render basic bold and list items
  const renderSimpleMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Split bold markers **text**
      const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
      const renderedLine = boldParts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={idx}>
          {renderedLine}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="iuls-assistant-root">
      {/* Floating Toggle Button & Speech Bubble */}
      {!isOpen && (
        <div className="assistant-launcher-container">
          {showBubble && (
            <div
              className="assistant-bubble-popup"
              role="status"
              onClick={() => {
                setIsOpen(true);
                setShowBubble(false);
              }}
            >
              <span className="bubble-text">Assistant is waiting for you</span>
              <button
                type="button"
                className="bubble-close-btn"
                title="Dismiss message"
                aria-label="Dismiss notification"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}

          <button
            type="button"
            className="iuls-assistant-circle-btn"
            onClick={() => {
              setIsOpen(true);
              setShowBubble(false);
            }}
            title="Open IULS Scholar AI"
            aria-label="Open IULS Scholar AI Assistant"
          >
            <img src={logoTransparent} alt="IULS Logo" className="circle-btn-logo" />
            <span className="circle-status-dot" title="Online"></span>
          </button>
        </div>
      )}

      {/* Expanded Chat Drawer / Window */}
      {isOpen && (
        <div className="iuls-assistant-window" role="dialog" aria-label="IULS Scholar AI Chat">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-header-info">
              <div className="assistant-header-icon">
                <img src={logoTransparent} alt="IULS Logo" className="header-logo-img" />
              </div>
              <div className="assistant-header-titles">
                <h3>IULS Scholar AI</h3>
                <div className="assistant-status-row">
                  <span className="status-dot"></span>
                  <span>Academic Companion • Ready</span>
                </div>
              </div>
            </div>

            <div className="assistant-header-actions">
              <button
                type="button"
                className="assistant-action-btn"
                title="Reset conversation"
                onClick={handleClearChat}
                aria-label="Clear chat"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button
                type="button"
                className="assistant-action-btn"
                title="Minimize assistant"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="assistant-messages-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`assistant-msg-row ${msg.role}`}>
                <span className="msg-sender-tag">
                  {msg.role === 'assistant' ? 'Scholar AI' : 'You'}
                </span>
                <div className="msg-bubble">
                  {renderFormattedText(msg.text)}
                </div>
                <span className="msg-time">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="assistant-msg-row assistant">
                <span className="msg-sender-tag">Scholar AI</span>
                <div className="assistant-typing-indicator" aria-label="Scholar AI is thinking">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts Ribbon */}
          <div className="assistant-quick-prompts">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.id}
                type="button"
                className="quick-chip-btn"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="assistant-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="assistant-input-box"
              placeholder="Ask an academic doubt, request books, or ask for advice..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="assistant-send-btn"
              disabled={isLoading || !inputValue.trim()}
              title="Send message"
              aria-label="Send"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
