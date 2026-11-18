export interface Chapter {
  id: number;
  title: string;
  readTimeMinutes: number;
  content: string[];
}

export interface AISummaryData {
  executiveSummary: string;
  keyTakeaways: string[];
  coreConcepts: { term: string; explanation: string }[];
  targetAudience: string;
  estimatedReadTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sampleQuestions: string[];
  quickAiAnswers?: Record<string, string>;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  year: number;
  language: string;
  isbn: string;
  subjects: string[];
  abstract: string;
  rating: number;
  reviewsCount: number;
  coverImage?: string;
  coverGradient?: string;
  badge?: "Bestseller" | "Featured" | "New" | "Trending" | "Academic" | "Popular";
  category: "Featured Books" | "Featured Research" | "New Arrivals" | "Popular";
  aiSummary: AISummaryData;
  chapters: Chapter[];
}
