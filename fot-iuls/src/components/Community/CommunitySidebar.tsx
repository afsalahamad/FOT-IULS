import type { Discussion, TopContributor } from "../../types/community";
import "./CommunitySidebar.css";

interface CommunitySidebarProps {
  popularTopics: string[];
  trendingDiscussions: Discussion[];
  contributors: TopContributor[];
  onSelectTopic: (topic: string) => void;
  onSelectDiscussion: (discussion: Discussion) => void;
}

export function CommunitySidebar({
  popularTopics,
  trendingDiscussions,
  contributors,
  onSelectTopic,
  onSelectDiscussion
}: CommunitySidebarProps) {
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
    <aside className="community-sidebar" aria-label="Community Highlights & Guidelines">
      {/* Popular Academic Topics */}
      <section className="sidebar-widget">
        <h3 className="widget-title">
          <span>Popular Academic Topics</span>
        </h3>
        <div className="topics-cloud">
          {popularTopics.map((topic, i) => (
            <button
              key={i}
              type="button"
              className="topic-cloud-btn"
              onClick={() => onSelectTopic(topic)}
            >
              #{topic}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Discussions */}
      <section className="sidebar-widget">
        <h3 className="widget-title">
          <span>Trending Discussions</span>
        </h3>
        <div className="trending-list">
          {trendingDiscussions.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="trending-item"
              onClick={() => onSelectDiscussion(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDiscussion(item);
                }
              }}
            >
              <h4 className="trending-title">{item.title}</h4>
              <div className="trending-meta">
                <span>{item.likesCount} endorsements</span>
                <span>•</span>
                <span>{item.commentsCount} replies</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Academic Contributors */}
      <section className="sidebar-widget">
        <h3 className="widget-title">
          <span>Top Contributors</span>
        </h3>
        <div className="contributors-list">
          {contributors.map((c) => (
            <div key={c.id} className="contributor-item">
              <div className="contributor-info-row">
                <div className="contributor-avatar">
                  {getInitials(c.name)}
                </div>
                <div className="contributor-name-col">
                  <span className="contributor-name">{c.name}</span>
                  <span className="contributor-dept">{c.department}</span>
                </div>
              </div>
              <span className="contributor-score">{c.reputationPoints} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Community Guidelines */}
      <section className="sidebar-widget">
        <h3 className="widget-title">
          <span>Academic Guidelines</span>
        </h3>
        <ul className="guidelines-list">
          <li><strong>Academic Integrity:</strong> Cite literature, datasets, and prior peer work honestly.</li>
          <li><strong>Constructive Debate:</strong> Focus critiques strictly on evidence, methodology, and logic.</li>
          <li><strong>Resource Sharing:</strong> Verify copyright before attaching course or lab materials.</li>
          <li><strong>Respectful Conduct:</strong> Support fellow students, junior researchers, and staff.</li>
        </ul>
        <div className="guidelines-footer-note">
          Adheres to the IULS University Academic Honor Code.
        </div>
      </section>
    </aside>
  );
}

export default CommunitySidebar;
