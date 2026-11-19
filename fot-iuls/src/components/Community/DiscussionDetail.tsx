import { useState } from "react";
import type { Discussion, UserRole } from "../../types/community";
import "./DiscussionDetail.css";

interface DiscussionDetailProps {
  discussion: Discussion;
  defaultAuthorName?: string;
  defaultAuthorRole?: UserRole;
  isAuthenticated?: boolean;
  onClose: () => void;
  onLikeToggle: (discussionId: string) => void;
  onAddComment: (discussionId: string, content: string, authorName: string, authorRole: UserRole) => void;
}

export function DiscussionDetail({
  discussion,
  defaultAuthorName = "Scholar User",
  defaultAuthorRole = "Student",
  isAuthenticated = true,
  onClose,
  onLikeToggle,
  onAddComment
}: DiscussionDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState(defaultAuthorName);
  const [commentRole, setCommentRole] = useState<UserRole>(defaultAuthorRole);

  const getInitials = (name: string) => {
    return name
      .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(
      discussion.id,
      commentText.trim(),
      commentAuthor.trim() || "Academic Member",
      commentRole
    );
    setCommentText("");
  };

  return (
    <div className="discussion-detail-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="discussion-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="detail-header-bar">
          <button type="button" className="detail-nav-back" onClick={onClose}>
            ← Back to Discussion Feed
          </button>
          <span className="category-tag-pill">{discussion.category}</span>
        </div>

        {/* Scrollable Content Body */}
        <div className="detail-scroll-body">
          {/* Author Metadata */}
          <div className="detail-meta-row">
            <div className="detail-author-block">
              <div className="detail-author-avatar">
                {getInitials(discussion.authorName)}
              </div>
              <div className="detail-author-text">
                <div className="detail-author-name-row">
                  <span className="detail-author-name">{discussion.authorName}</span>
                  <span className={`role-badge ${discussion.authorRole}`}>
                    {discussion.authorRole}
                  </span>
                </div>
                <span className="detail-timestamp">Published {discussion.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Full Discussion Title & Content */}
          <h1 className="detail-title">{discussion.title}</h1>
          <p className="detail-content-text">{discussion.content}</p>

          {/* Attached Academic Resources */}
          {discussion.attachments && discussion.attachments.length > 0 && (
            <div className="detail-resources-box">
              <h4 className="detail-resources-title">
                <span>Attached Academic Resources ({discussion.attachments.length})</span>
              </h4>
              <div className="detail-attachments-list">
                {discussion.attachments.map((att) => (
                  <div key={att.id} className="detail-attachment-row">
                    <span>
                      [{att.type.toUpperCase()}] {att.name} ({att.size})
                    </span>
                    <button
                      type="button"
                      className="detail-download-btn"
                      onClick={() => alert(`Downloading ${att.name}...`)}
                    >
                      Download Resource
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Like & Share Action Bar */}
          <div className="detail-actions-bar">
            <button
              type="button"
              className={`detail-like-btn ${discussion.userLiked ? "liked" : ""}`}
              onClick={() => onLikeToggle(discussion.id)}
            >
              <span>▲ {discussion.userLiked ? "Endorsed" : "Endorse"}</span>
              <span>({discussion.likesCount})</span>
            </button>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {discussion.commentsCount} replies
            </span>
          </div>

          {/* Comments & Peer Discussions */}
          <section className="comments-section">
            <h3 className="comments-header-title">
              <span>Academic Peer Responses ({discussion.comments.length})</span>
            </h3>

            {/* Existing Comments */}
            <div className="comments-list">
              {discussion.comments.map((comm) => (
                <div key={comm.id} className="comment-card">
                  <div className="comment-header-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="comment-author-name">{comm.authorName}</span>
                      <span className={`role-badge ${comm.authorRole}`}>
                        {comm.authorRole}
                      </span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{comm.createdAt}</span>
                  </div>
                  <p className="comment-content">{comm.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment / Reply Form */}
            {isAuthenticated ? (
              <form className="add-comment-form" onSubmit={handleCommentSubmit}>
                <div className="comment-user-row">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                  />
                  <select
                    value={commentRole}
                    onChange={(e) => setCommentRole(e.target.value as UserRole)}
                  >
                    <option value="Student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Researcher">Researcher</option>
                  </select>
                </div>

                <textarea
                  className="comment-textarea"
                  placeholder="Share constructive feedback, reference related studies, or offer a solution..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />

                <button type="submit" className="submit-comment-btn">
                  Post Response
                </button>
              </form>
            ) : (
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", fontSize: "13.5px", color: "#475569" }}>
                <a href="#login" style={{ color: "#2563eb", fontWeight: 600 }} onClick={onClose}>
                  Sign in
                </a>{" "}
                to post a response or endorse this discussion.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default DiscussionDetail;
