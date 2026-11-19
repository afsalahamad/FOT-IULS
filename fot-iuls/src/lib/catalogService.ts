import { INITIAL_BOOKS } from "../data/booksData";
import type { AISummaryData, BookItem, Chapter } from "../types/book";
import type { Scope } from "../components/SearchBar/types";
import { isSupabaseConfigured, supabase } from "./supabase";

interface BookRow {
  id: string;
  title: string;
  author: string;
  year: number;
  language: string;
  isbn: string;
  subjects: string[];
  abstract: string;
  rating: number | string;
  reviews_count: number;
  cover_image: string;
  cover_gradient: string;
  pdf_url: string | null;
  pdf_path: string | null;
  badge: BookItem["badge"] | null;
  category: BookItem["category"];
  ai_summary: Partial<AISummaryData> | null;
  chapters: Chapter[] | null;
}

export interface ParsedPdfResult {
  title: string;
  author: string;
  pages: number;
  abstract: string;
  estimatedReadTime: string;
  chapters: Chapter[];
}

export interface UpsertBookPayload {
  id?: string;
  title: string;
  author: string;
  year: number;
  language: string;
  isbn: string;
  subjects: string[];
  abstract: string;
  rating: number;
  category: BookItem["category"];
  badge?: BookItem["badge"];
  coverImage?: string;
  coverFile?: File | null;
  pdfUrl?: string;
  pdfPath?: string;
  pdfFile?: File | null;
  chapters?: Chapter[];
  aiSummary?: AISummaryData;
}

const BOOK_SELECT_COLUMNS =
  "id, title, author, year, language, isbn, subjects, abstract, rating, reviews_count, cover_image, cover_gradient, pdf_url, pdf_path, badge, category, ai_summary, chapters";

function buildDefaultSummary(title: string, author: string, abstract: string, subjects: string[]): AISummaryData {
  const cleanAbstract =
    abstract.trim() ||
    `${title} by ${author} introduces core concepts across ${subjects.join(", ") || "academic studies"}.`;
  return {
    executiveSummary: cleanAbstract,
    keyTakeaways: [
      `Authored by ${author} to support university coursework and independent study.`,
      subjects.length > 0
        ? `Covers core topics including ${subjects.join(", ")}.`
        : "Provides structured foundations and applied academic examples.",
    ],
    coreConcepts: subjects.slice(0, 3).map((subject) => ({
      term: subject.replace(/\b\w/g, (c) => c.toUpperCase()),
      explanation: `Core subject domain examined in ${title}.`,
    })),
    targetAudience: "University students, researchers, and faculty.",
    estimatedReadTime: "3 hours 30 mins",
    difficulty: "Intermediate",
    sampleQuestions: [
      `What are the main themes covered in "${title}"?`,
      `How can students apply the concepts from "${title}" in coursework?`,
    ],
  };
}

function buildDefaultChapters(title: string, abstract: string): Chapter[] {
  return [
    {
      id: 1,
      title: "1. Overview & Introduction",
      readTimeMinutes: 12,
      content: [
        abstract.trim() || `Welcome to "${title}". This opening section outlines the scope and learning goals of the text.`,
        "Use the IULS AI Reading Companion on the right to ask live questions, generate concept explanations, or switch to PDF Viewer mode to inspect the original document.",
      ],
    },
  ];
}

function mapRowToBook(row: BookRow): BookItem {
  const subjects = Array.isArray(row.subjects) ? row.subjects : [];
  const defaultSummary = buildDefaultSummary(row.title, row.author, row.abstract || "", subjects);
  const rawSummary = row.ai_summary || {};
  const chapters =
    Array.isArray(row.chapters) && row.chapters.length > 0
      ? row.chapters
      : buildDefaultChapters(row.title, row.abstract || "");

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: Number(row.year) || new Date().getFullYear(),
    language: row.language || "en",
    isbn: row.isbn || "",
    subjects,
    abstract: row.abstract || "",
    rating: Number(row.rating) || 4.5,
    reviewsCount: Number(row.reviews_count) || 0,
    coverImage: row.cover_image && row.cover_image !== "/ai.jpg" ? row.cover_image : "",
    coverGradient: row.cover_gradient || "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    pdfUrl: row.pdf_url || undefined,
    pdfPath: row.pdf_path || undefined,
    badge: row.badge || undefined,
    category: row.category || "Featured Books",
    aiSummary: {
      executiveSummary: rawSummary.executiveSummary || defaultSummary.executiveSummary,
      keyTakeaways:
        Array.isArray(rawSummary.keyTakeaways) && rawSummary.keyTakeaways.length > 0
          ? rawSummary.keyTakeaways
          : defaultSummary.keyTakeaways,
      coreConcepts:
        Array.isArray(rawSummary.coreConcepts) && rawSummary.coreConcepts.length > 0
          ? rawSummary.coreConcepts
          : defaultSummary.coreConcepts,
      targetAudience: rawSummary.targetAudience || defaultSummary.targetAudience,
      estimatedReadTime: rawSummary.estimatedReadTime || defaultSummary.estimatedReadTime,
      difficulty: rawSummary.difficulty || defaultSummary.difficulty,
      sampleQuestions:
        Array.isArray(rawSummary.sampleQuestions) && rawSummary.sampleQuestions.length > 0
          ? rawSummary.sampleQuestions
          : defaultSummary.sampleQuestions,
      quickAiAnswers: rawSummary.quickAiAnswers,
    },
    chapters,
  };
}

export async function triggerBackendReindex(): Promise<void> {
  try {
    await fetch("/api/catalog/reindex", { method: "POST" });
  } catch {
    // Non-blocking: backend may not be running during frontend-only sessions.
  }
}

export async function parseCatalogPdf(file: File): Promise<ParsedPdfResult | null> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/reader/parse-catalog-pdf", {
      method: "POST",
      body: form,
    });
    if (!res.ok) return null;
    return (await res.json()) as ParsedPdfResult;
  } catch {
    return null;
  }
}

export async function fetchCatalogBooks(): Promise<BookItem[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_BOOKS;
  }

  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[Catalog] Could not fetch books from Supabase, using fallback:", error?.message);
    return INITIAL_BOOKS;
  }

  return (data as BookRow[]).map(mapRowToBook);
}

export async function fetchBookById(bookId: string): Promise<BookItem | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("books")
      .select(BOOK_SELECT_COLUMNS)
      .eq("id", bookId)
      .maybeSingle();

    if (!error && data) {
      return mapRowToBook(data as BookRow);
    }
  }

  return INITIAL_BOOKS.find((b) => b.id.toLowerCase() === bookId.toLowerCase()) ?? null;
}

export async function uploadBookCover(file: File, bookId: string): Promise<string> {
  const safeExt = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "png";
  const path = `${bookId}-${Date.now()}.${safeExt}`;

  const { error } = await supabase.storage.from("book-covers").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    throw new Error(`Cover upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBookPdf(
  file: File,
  bookId: string
): Promise<{ pdfUrl: string; pdfPath: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const pdfPath = `${bookId}/${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage.from("book-pdfs").upload(pdfPath, file, {
    upsert: true,
    contentType: "application/pdf",
  });
  if (error) {
    throw new Error(`PDF upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("book-pdfs").getPublicUrl(pdfPath);
  return { pdfUrl: data.publicUrl, pdfPath };
}

export async function upsertCatalogBook(payload: UpsertBookPayload, userId?: string): Promise<BookItem> {
  const bookId = payload.id?.trim() || `b-${crypto.randomUUID().slice(0, 8)}`;
  let coverImage = payload.coverImage?.trim() && payload.coverImage.trim() !== "/ai.jpg" ? payload.coverImage.trim() : "";
  let pdfUrl = payload.pdfUrl?.trim() || null;
  let pdfPath = payload.pdfPath?.trim() || null;

  if (payload.coverFile) {
    coverImage = await uploadBookCover(payload.coverFile, bookId);
  }

  if (payload.pdfFile) {
    const uploaded = await uploadBookPdf(payload.pdfFile, bookId);
    pdfUrl = uploaded.pdfUrl;
    pdfPath = uploaded.pdfPath;
  }

  const subjects = payload.subjects.map((s) => s.trim()).filter(Boolean);
  const aiSummary =
    payload.aiSummary ?? buildDefaultSummary(payload.title, payload.author, payload.abstract, subjects);
  const chapters =
    payload.chapters && payload.chapters.length > 0
      ? payload.chapters
      : buildDefaultChapters(payload.title, payload.abstract);

  const row = {
    id: bookId,
    title: payload.title.trim(),
    author: payload.author.trim(),
    year: payload.year,
    language: payload.language.trim() || "en",
    isbn: payload.isbn.replace(/[-\s]/g, "").trim(),
    subjects,
    abstract: payload.abstract.trim(),
    rating: Math.min(5, Math.max(0, Number(payload.rating) || 4.5)),
    category: payload.category,
    badge: payload.badge ?? null,
    cover_image: coverImage,
    pdf_url: pdfUrl,
    pdf_path: pdfPath,
    ai_summary: aiSummary,
    chapters,
    ...(payload.id ? {} : { created_by: userId ?? null }),
  };

  const { data, error } = await supabase
    .from("books")
    .upsert(row, { onConflict: "id" })
    .select(BOOK_SELECT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not save the book to Supabase.");
  }

  void triggerBackendReindex();
  return mapRowToBook(data as BookRow);
}

export async function deleteCatalogBook(bookId: string, pdfPath?: string): Promise<void> {
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) {
    throw new Error(error.message);
  }
  if (pdfPath) {
    await supabase.storage.from("book-pdfs").remove([pdfPath]);
  }
  void triggerBackendReindex();
}

export async function searchCatalogSemantic(params: {
  q: string;
  scope?: Scope;
  language?: string;
  yearFrom?: number;
}): Promise<string[] | null> {
  const clean = params.q.trim();
  if (!clean) return null;

  const qs = new URLSearchParams({ q: clean, scope: params.scope || "all", limit: "30" });
  if (params.language) qs.set("language", params.language);
  if (params.yearFrom) qs.set("year_from", String(params.yearFrom));

  try {
    const res = await fetch(`/api/search?${qs}`);
    if (!res.ok) return null;
    const data: { items?: Array<{ id: string }> } = await res.json();
    if (!Array.isArray(data.items)) return null;
    return data.items.map((item) => item.id);
  } catch {
    return null;
  }
}
