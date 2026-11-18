import type { Discussion } from "../../types/community";
import "./DiscussionCard.css";

interface DiscussionCardProps {
  discussion: Discussion;
  onSelect: (discussion: Discussion) => void;
  onLikeToggle: (discussionId: string, e: React.MouseEvent) => void;
  onShare: (discussion: Discussion, e: React.MouseEvent) => void;
}

export function DiscussionCard({
  discussion,
  onSelect,
  onLikeToggle,
  onShare
}: DiscussionCardProps) {
  const getInitials = (name: string) => {
    return name
      .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <article
      className="discussion-card"
      onClick={() => onSelect(discussion)}
      tabIndex={0}
      role="button"
      aria-label={`Discussion: ${discussion.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(discussion);
        }
      }}
    >
      {/* Header Row: Author Metadata & Category */}
      <div className="card-header-row">
        <div className="author-meta-block">
          <div className="author-avatar-badge" aria-hidden="true">
            {getInitials(discussion.authorName)}
          </div>
          <div className="author-info-text">
            <div className="author-name-row">
              <span className="author-name">{discussion.authorName}</span>
              <span className={`role-badge ${discussion.authorRole}`}>
                {discussion.authorRole}
              </span>
            </div>
            <span className="publication-time">{discussion.createdAt}</span>
          </div>
        </div>

        <span className="category-tag-pill">{discussion.category}</span>
      </div>

      {/* Title & Short Description */}
      <h3 className="discussion-title">{discussion.title}</h3>
      <p className="discussion-snippet">{discussion.content}</p>

      {/* Attachments (if any) */}
      {discussion.attachments && discussion.attachments.length > 0 && (
        <div className="card-attachments-list">
          {discussion.attachments.map((att) => (
            <span key={att.id} className="attachment-chip" title={`${att.name} (${att.size})`}>
              <span className="attachment-chip-icon">
                [{att.type.toUpperCase()}]
              </span>
              <span>{att.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Tags Row */}
      {discussion.tags && discussion.tags.length > 0 && (
        <div className="discussion-tags-row">
          {discussion.tags.map((tag, idx) => (
            <span key={idx} className="topic-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions Footer */}
      <div className="card-actions-footer">
        <div className="action-buttons-group">
          {/* Like Button */}
          <button
            type="button"
            className={`card-action-btn ${discussion.userLiked ? "liked" : ""}`}
            onClick={(e) => onLikeToggle(discussion.id, e)}
            aria-label={`${discussion.likesCount} endorsements`}
          >
            <span>▲</span>
            <span>{discussion.likesCount} {discussion.userLiked ? "Endorsed" : "Endorse"}</span>
          </button>

          {/* Comment Count Button */}
          <button
            type="button"
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(discussion);
            }}
            aria-label={`${discussion.commentsCount} replies`}
          >
            <span>{discussion.commentsCount} Replies</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="card-action-btn"
            onClick={(e) => onShare(discussion, e)}
            title="Copy discussion link"
          >
            <span>Share</span>
          </button>
        </div>

        <div className="read-discussion-link">
          <span>Read & Join Discussion →</span>
        </div>
      </div>
    </article>
  );
}

export default DiscussionCard;
