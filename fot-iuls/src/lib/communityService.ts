import { INITIAL_DISCUSSIONS } from "../data/communityData";
import type { Attachment, Comment, Discussion, UserRole } from "../types/community";
import { isSupabaseConfigured, supabase } from "./supabase";

interface DiscussionRow {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  category: string;
  author_name: string;
  author_role: UserRole;
  tags: string[];
  attachments: Attachment[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface CommentRow {
  id: string;
  discussion_id: string;
  user_id: string | null;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export async function fetchDiscussions(currentUserId?: string): Promise<Discussion[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_DISCUSSIONS;
  }

  const [discRes, commRes, likesRes] = await Promise.all([
    supabase
      .from("discussions")
      .select("id, user_id, title, content, category, author_name, author_role, tags, attachments, likes_count, comments_count, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("discussion_comments")
      .select("id, discussion_id, user_id, author_name, author_role, content, created_at")
      .order("created_at", { ascending: true }),
    currentUserId
      ? supabase
          .from("discussion_likes")
          .select("discussion_id")
          .eq("user_id", currentUserId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (discRes.error || !discRes.data) {
    console.warn("[Community] Failed to fetch discussions from Supabase:", discRes.error?.message);
    return INITIAL_DISCUSSIONS;
  }

  const likedIds = new Set<string>(
    ((likesRes.data as Array<{ discussion_id: string }> | null) ?? []).map((l) => l.discussion_id)
  );

  const commentsByDiscussion = new Map<string, Comment[]>();
  for (const row of (commRes.data as CommentRow[] | null) ?? []) {
    const list = commentsByDiscussion.get(row.discussion_id) ?? [];
    list.push({
      id: row.id,
      discussionId: row.discussion_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      createdAt: formatRelativeTime(row.created_at),
      content: row.content,
      likesCount: 0,
      userLiked: false,
    });
    commentsByDiscussion.set(row.discussion_id, list);
  }

  return (discRes.data as DiscussionRow[]).map((row) => {
    const comments = commentsByDiscussion.get(row.id) ?? [];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      authorName: row.author_name,
      authorRole: row.author_role,
      createdAt: formatRelativeTime(row.created_at),
      likesCount: row.likes_count,
      userLiked: likedIds.has(row.id),
      commentsCount: Math.max(row.comments_count, comments.length),
      comments,
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
    };
  });
}

export async function createDiscussionInDb(
  userId: string,
  payload: Omit<Discussion, "id" | "likesCount" | "userLiked" | "commentsCount" | "comments" | "createdAt">
): Promise<Discussion> {
  const { data, error } = await supabase
    .from("discussions")
    .insert({
      user_id: userId,
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category,
      author_name: payload.authorName.trim(),
      author_role: payload.authorRole,
      tags: payload.tags,
      attachments: payload.attachments ?? [],
    })
    .select("id, user_id, title, content, category, author_name, author_role, tags, attachments, likes_count, comments_count, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not publish discussion.");
  }

  const row = data as DiscussionRow;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    authorName: row.author_name,
    authorRole: row.author_role,
    createdAt: "Just now",
    likesCount: row.likes_count,
    userLiked: false,
    commentsCount: 0,
    comments: [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export async function toggleDiscussionLikeInDb(
  discussionId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("discussion_likes")
      .delete()
      .eq("discussion_id", discussionId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase
    .from("discussion_likes")
    .insert({ discussion_id: discussionId, user_id: userId });
  if (error) throw new Error(error.message);
  return true;
}

export async function addDiscussionCommentInDb(
  discussionId: string,
  userId: string,
  content: string,
  authorName: string,
  authorRole: UserRole
): Promise<Comment> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .insert({
      discussion_id: discussionId,
      user_id: userId,
      content: content.trim(),
      author_name: authorName.trim(),
      author_role: authorRole,
    })
    .select("id, discussion_id, user_id, author_name, author_role, content, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not post comment.");
  }

  const row = data as CommentRow;
  return {
    id: row.id,
    discussionId: row.discussion_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    createdAt: "Just now",
    content: row.content,
    likesCount: 0,
    userLiked: false,
  };
}
