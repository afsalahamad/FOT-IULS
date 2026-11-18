export interface Chapter {
  id: number;
  title: string;
  text: string;
}

export interface Book {
  book_id: string;
  title: string;
  chapters: Chapter[];
}

export type SummaryStyle = "short" | "bullets" | "detailed";
