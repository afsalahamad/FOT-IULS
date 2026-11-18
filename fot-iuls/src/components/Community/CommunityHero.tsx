import type { CommunityStats } from "../../types/community";
import "./CommunityHero.css";

interface CommunityHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  stats: CommunityStats;
}

export function CommunityHero({
  searchQuery,
  onSearchChange,
  onCreateClick,
  stats
}: CommunityHeroProps) {
  return (
    <header className="community-hero" aria-label="Academic Community Header">
      <div className="hero-main-content">
        <div className="hero-badge">
          <span>IULS Collaborative Research & Learning Hub</span>
        </div>

        <h1>Welcome to the IULS Academic Community</h1>
        <p className="hero-subtitle">
          Connect, collaborate and grow together through knowledge sharing and academic discussions.
        </p>

        {/* Search & Create Actions */}
        <div className="hero-action-bar">
          <div className="hero-search-wrapper">
            <svg
              className="hero-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search discussions, research questions, methodologies or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search discussions"
            />
            {searchQuery && (
              <button
                type="button"
                className="hero-clear-search"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="hero-create-btn"
            onClick={onCreateClick}
          >
            <span>+</span>
            <span>Create Discussion</span>
          </button>
        </div>

        {/* Community Statistics */}
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <div className="stat-number">{stats.totalMembers.toLocaleString()}</div>
            <div className="stat-label">Academic Members</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">{stats.totalDiscussions.toLocaleString()}</div>
            <div className="stat-label">Discussions</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">{stats.totalResources.toLocaleString()}</div>
            <div className="stat-label">Shared Resources</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">{stats.activeToday.toLocaleString()}</div>
            <div className="stat-label">Active Today</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default CommunityHero;
