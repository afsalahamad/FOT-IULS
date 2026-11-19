import type { BookItem } from "../types/book";

const STORAGE_KEYS = {
  papers: "iuls:student-papers",
  notes: "iuls:student-notes",
  savedBooks: "iuls:saved-books",
} as const;

export type PaperStatus = "pending" | "approved" | "revision";

export interface StudentPaper {
  id: string;
  title: string;
  authors: string;
  field: string;
  abstract: string;
  fileName: string;
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

function readList<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Saved workspace data for "${key}" is invalid.`);
  }
  return parsed as T[];
}

function writeList<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStudentPapers(): StudentPaper[] {
  return readList<StudentPaper>(STORAGE_KEYS.papers);
}

export function saveStudentPapers(papers: StudentPaper[]) {
  writeList(STORAGE_KEYS.papers, papers);
}

export function getStudentNotes(): StudentNote[] {
  return readList<StudentNote>(STORAGE_KEYS.notes);
}

export function saveStudentNotes(notes: StudentNote[]) {
  writeList(STORAGE_KEYS.notes, notes);
}

export function getSavedBookIds(): string[] {
  return readList<string>(STORAGE_KEYS.savedBooks);
}

export function saveSavedBookIds(ids: string[]) {
  writeList(STORAGE_KEYS.savedBooks, ids);
}

function openAttachmentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("iuls-student-workspace", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("paper-attachments");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open paper storage."));
  });
}

export async function savePaperAttachment(id: string, file: File): Promise<void> {
  const database = await openAttachmentDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("paper-attachments", "readwrite");
      transaction.objectStore("paper-attachments").put(file, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save the paper file."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Saving the paper file was cancelled."));
    });
  } finally {
    database.close();
  }
}

export async function deletePaperAttachment(id: string): Promise<void> {
  const database = await openAttachmentDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("paper-attachments", "readwrite");
      transaction.objectStore("paper-attachments").delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not remove the paper file."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Removing the paper file was cancelled."));
    });
  } finally {
    database.close();
  }
}

export async function downloadPaperAttachment(paper: StudentPaper): Promise<void> {
  const database = await openAttachmentDatabase();
  let file: Blob | undefined;
  try {
    file = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = database.transaction("paper-attachments").objectStore("paper-attachments").get(paper.id);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error ?? new Error("Could not load the uploaded paper."));
    });
  } finally {
    database.close();
  }

  if (!file) {
    throw new Error("The uploaded paper file is no longer available in this browser.");
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = paper.fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    ...book.chapters.flatMap((chapter) => [
      chapter.title,
      ...chapter.content,
      "",
    ]),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${book.title.replace(/[^\w-]+/g, "-")}.txt`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
