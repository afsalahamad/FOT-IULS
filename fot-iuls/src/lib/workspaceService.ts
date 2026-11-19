import type { BookItem } from "../types/book";
import type { AppRole, UserProfile } from "../context/useAuth";
import { supabase } from "./supabase";

export type PaperStatus = "pending" | "approved" | "revision";

export interface ResearchPaper {
  id: string;
  userId: string | null;
  title: string;
  authors: string;
  field: string;
  abstract: string;
  year: number;
  doi: string;
  citations: number;
  fileName: string | null;
  filePath: string | null;
  submittedAt: string;
  status: PaperStatus;
  reviewerNote: string;
}

export interface StudentNote {
  id: string;
  title: string;
  bookId: string;
  body: string;
  updatedAt: string;
}

export interface AdminOverviewStats {
  totalBooks: number;
  totalChapters: number;
  registeredUsers: number;
  totalNotes: number;
  pendingPapers: number;
}

interface ResearchPaperRow {
  id: string;
  user_id: string | null;
  title: string;
  authors: string;
  field: string;
  abstract: string;
  year: number;
  doi: string;
  citations: number;
  file_name: string | null;
  file_path: string | null;
  submitted_at: string;
  status: PaperStatus;
  reviewer_note: string;
}

interface NoteRow {
  id: string;
  title: string;
  book_id: string | null;
  body: string;
  updated_at: string;
}

function mapPaper(row: ResearchPaperRow): ResearchPaper {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    authors: row.authors,
    field: row.field,
    abstract: row.abstract,
    year: row.year,
    doi: row.doi || "Student research",
    citations: row.citations || 0,
    fileName: row.file_name,
    filePath: row.file_path,
    submittedAt: row.submitted_at,
    status: row.status,
    reviewerNote: row.reviewer_note || "",
  };
}

function mapNote(row: NoteRow): StudentNote {
  return {
    id: row.id,
    title: row.title,
    bookId: row.book_id ?? "",
    body: row.body,
    updatedAt: row.updated_at,
  };
}

// Saved Books
export async function fetchSavedBookIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_books")
    .select("book_id")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.book_id as string);
}

export async function toggleSavedBookInDb(
  userId: string,
  bookId: string,
  currentlySaved: boolean
): Promise<boolean> {
  if (currentlySaved) {
    const { error } = await supabase
      .from("saved_books")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase
    .from("saved_books")
    .insert({ user_id: userId, book_id: bookId });
  if (error) throw new Error(error.message);
  return true;
}

// Student Notes
export async function fetchStudentNotes(userId: string): Promise<StudentNote[]> {
  const { data, error } = await supabase
    .from("student_notes")
    .select("id, title, book_id, body, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as NoteRow[] | null ?? []).map(mapNote);
}

export async function saveStudentNote(
  userId: string,
  note: { id?: string | null; title: string; bookId: string; body: string }
): Promise<StudentNote> {
  const payload = {
    user_id: userId,
    title: note.title.trim(),
    book_id: note.bookId || null,
    body: note.body.trim(),
  };

  if (note.id) {
    const { data, error } = await supabase
      .from("student_notes")
      .update(payload)
      .eq("id", note.id)
      .eq("user_id", userId)
      .select("id, title, book_id, body, updated_at")
      .single();
    if (error || !data) throw new Error(error?.message || "Could not update note.");
    return mapNote(data as NoteRow);
  }

  const { data, error } = await supabase
    .from("student_notes")
    .insert(payload)
    .select("id, title, book_id, body, updated_at")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not create note.");
  return mapNote(data as NoteRow);
}

export async function deleteStudentNote(noteId: string): Promise<void> {
  const { error } = await supabase.from("student_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
}

// Research Papers
export async function fetchApprovedResearchPapers(): Promise<ResearchPaper[]> {
  const { data, error } = await supabase
    .from("research_papers")
    .select("id, user_id, title, authors, field, abstract, year, doi, citations, file_name, file_path, submitted_at, status, reviewer_note")
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as ResearchPaperRow[] | null) ?? []).map(mapPaper);
}

export async function fetchMyResearchPapers(userId: string): Promise<ResearchPaper[]> {
  const { data, error } = await supabase
    .from("research_papers")
    .select("id, user_id, title, authors, field, abstract, year, doi, citations, file_name, file_path, submitted_at, status, reviewer_note")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as ResearchPaperRow[] | null) ?? []).map(mapPaper);
}

export async function fetchAllSubmittedPapers(): Promise<ResearchPaper[]> {
  const { data, error } = await supabase
    .from("research_papers")
    .select("id, user_id, title, authors, field, abstract, year, doi, citations, file_name, file_path, submitted_at, status, reviewer_note")
    .not("user_id", "is", null)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as ResearchPaperRow[] | null) ?? []).map(mapPaper);
}

export async function submitResearchPaper(
  userId: string,
  form: { title: string; authors: string; field: string; abstract: string },
  file: File
): Promise<ResearchPaper> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const filePath = `${userId}/${crypto.randomUUID()}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("research-papers")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || "application/pdf",
    });

  if (uploadError) {
    throw new Error(`Could not upload paper file: ${uploadError.message}`);
  }

  const { data, error: insertError } = await supabase
    .from("research_papers")
    .insert({
      user_id: userId,
      title: form.title.trim(),
      authors: form.authors.trim(),
      field: form.field.trim(),
      abstract: form.abstract.trim(),
      year: new Date().getFullYear(),
      doi: "Student research",
      file_name: file.name,
      file_path: filePath,
      status: "pending",
      reviewer_note: "",
    })
    .select("id, user_id, title, authors, field, abstract, year, doi, citations, file_name, file_path, submitted_at, status, reviewer_note")
    .single();

  if (insertError || !data) {
    await supabase.storage.from("research-papers").remove([filePath]);
    throw new Error(insertError?.message || "Could not save paper submission.");
  }

  return mapPaper(data as ResearchPaperRow);
}

export async function reviewResearchPaper(
  paperId: string,
  status: PaperStatus,
  reviewerNote: string,
  reviewerId: string
): Promise<ResearchPaper> {
  const { data, error } = await supabase
    .from("research_papers")
    .update({
      status,
      reviewer_note: reviewerNote.trim(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq("id", paperId)
    .select("id, user_id, title, authors, field, abstract, year, doi, citations, file_name, file_path, submitted_at, status, reviewer_note")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not update paper review status.");
  }

  return mapPaper(data as ResearchPaperRow);
}

export async function downloadResearchPaperFile(paper: ResearchPaper): Promise<void> {
  if (!paper.filePath) {
    throw new Error("This paper does not have an attached file.");
  }

  const { data, error } = await supabase.storage
    .from("research-papers")
    .download(paper.filePath);

  if (error || !data) {
    throw new Error(error?.message || "Could not download the paper file.");
  }

  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = paper.fileName || "research-paper.pdf";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Admin Overview & Profiles
export async function fetchAdminOverviewStats(books: BookItem[]): Promise<AdminOverviewStats> {
  const totalChapters = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);

  const [profilesRes, pendingRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("research_papers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalBooks: books.length,
    totalChapters,
    registeredUsers: profilesRes.count ?? 0,
    totalNotes: 0,
    pendingPapers: pendingRes.count ?? 0,
  };
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, department, role")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as UserProfile[] | null) ?? [];
}

export async function updateProfileRole(userId: string, role: AppRole): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, full_name, email, phone, department, role")
    .single();

  if (error || !data) throw new Error(error?.message || "Could not update user role.");
  return data as UserProfile;
}

export function downloadBookText(book: BookItem): void {
  const content = [
    book.title,
    `By ${book.author} (${book.year})`,
    "",
    book.abstract,
    "",
    "Key takeaways",
    ...book.aiSummary.keyTakeaways.map((takeaway) => `- ${takeaway}`),
    "",
    ...book.chapters.flatMap((chapter) => [chapter.title, ...chapter.content, ""]),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${book.title.replace(/[^\w-]+/g, "-")}.txt`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
