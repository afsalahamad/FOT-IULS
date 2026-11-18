export type UserRole = "Student" | "Lecturer" | "Researcher";

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "doc" | "dataset" | "slides" | "code";
  url?: string;
}

export interface Comment {
  id: string;
  discussionId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: string;
  content: string;
  likesCount: number;
  userLiked?: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: string;
  likesCount: number;
  userLiked?: boolean;
  commentsCount: number;
  comments: Comment[];
  attachments?: Attachment[];
  tags: string[];
}

export interface AcademicCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  discussionsCount: number;
}

export interface TopContributor {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  reputationPoints: number;
  contributionsCount: number;
  avatar?: string;
}

export interface CommunityStats {
  totalMembers: number;
  totalDiscussions: number;
  totalResources: number;
  activeToday: number;
}
