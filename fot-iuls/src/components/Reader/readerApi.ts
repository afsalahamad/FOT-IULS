import type { Book } from "./types";

const API = "/api/reader";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    /* body was not JSON */
  }
  return `Request failed (${res.status})`;
}

/** Turns any thrown error into a message that is safe to show the reader. */
export function friendlyError(e: unknown): string {
  if (e instanceof HttpError) return e.message;
  if (e instanceof TypeError) return "Could not reach the backend. Make sure it is running on port 8001.";
  return "Something went wrong. Please try again.";
}

export async function uploadBook(file: File): Promise<Book> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new HttpError(res.status, await readError(res));
  return res.json();
}

export async function loadSampleBook(): Promise<Book> {
  const res = await fetch(`${API}/sample`);
  if (!res.ok) throw new HttpError(res.status, await readError(res));
  return res.json();
}

/** POSTs JSON and hands each piece of streamed text to onToken as it arrives. */
export async function streamPost(
  path: "summarize" | "ask",
  body: object,
  onToken: (text: string) => void,
  signal: AbortSignal
): Promise<void> {
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new HttpError(res.status, await readError(res));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}
