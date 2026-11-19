export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  error?: boolean;
}

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  category: 'books' | 'doubts' | 'motivation' | 'research';
}
