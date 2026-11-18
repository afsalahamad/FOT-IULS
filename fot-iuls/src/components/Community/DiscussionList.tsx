import { useState, useMemo } from "react";
import type { Discussion } from "../../types/community";
import DiscussionCard from "./DiscussionCard";
import "./DiscussionList.css";

interface DiscussionListProps {
  discussions: Discussion[];
  selectedCategory: string | null;
  searchQuery: string;
  onSelectDiscussion: (discussion: Discussion) => void;
  onLikeToggle: (discussionId: string, e: React.MouseEvent) => void;
  onShare: (discussion: Discussion, e: React.MouseEvent) => void;
  onResetFilters: () => void;
}

export function DiscussionList({
  discussions,
  selectedCategory,
  searchQuery,
  onSelectDiscussion,
  onLikeToggle,
  onShare,
  onResetFilters
}: DiscussionListProps) {
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "comments">("latest");

  const filteredDiscussions = useMemo(() => {
    let result = discussions.filter((item) => {
      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesTag) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "popular") {
        return b.likesCount - a.likesCount;
      }
      if (sortBy === "comments") {
        return b.commentsCount - a.commentsCount;
      }
      return 0; // Default latest preservation
    });

    return result;
  }, [discussions, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="discussion-feed-container">
      {/* Feed Control Bar */}
      <div className="feed-control-bar">
        <span className="feed-count-text">
          Showing <strong>{filteredDiscussions.length}</strong> academic discussion
          {filteredDiscussions.length === 1 ? "" : "s"}
          {selectedCategory ? ` in ${selectedCategory}` : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </span>

        <select
          className="feed-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "latest" | "popular" | "comments")}
          aria-label="Sort discussions"
        >
          <option value="latest">Latest Activity</option>
          <option value="popular">Most Endorsed (Likes)</option>
          <option value="comments">Most Discussed (Replies)</option>
        </select>
      </div>

      {/* Discussions Stack or Empty State */}
      {filteredDiscussions.length > 0 ? (
        <div className="discussions-stack">
          {filteredDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onSelect={onSelectDiscussion}
              onLikeToggle={onLikeToggle}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        <div className="feed-empty-state">
          <h3>No academic discussions found</h3>
          <p>
            No active threads matched your search query or selected academic category. Try adjusting your filters or start a new inquiry.
          </p>
          <button
            type="button"
            className="empty-reset-btn"
            onClick={onResetFilters}
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default DiscussionList;
