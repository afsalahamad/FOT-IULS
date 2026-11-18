import { useState, useEffect } from "react";
import type { Discussion, UserRole } from "../types/community";
import {
  ACADEMIC_CATEGORIES,
  INITIAL_COMMUNITY_STATS,
  INITIAL_DISCUSSIONS,
  POPULAR_TOPICS,
  TOP_CONTRIBUTORS
} from "../data/communityData";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CommunityHero from "../components/Community/CommunityHero";
import CommunityCategories from "../components/Community/CommunityCategories";
import DiscussionList from "../components/Community/DiscussionList";
import CommunitySidebar from "../components/Community/CommunitySidebar";
import CreateDiscussion from "../components/Community/CreateDiscussion";
import DiscussionDetail from "../components/Community/DiscussionDetail";
import "./Community.css";

interface CommunityProps {
  profileName?: string;
}

export function Community({ profileName = "Scholar User" }: CommunityProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>(INITIAL_DISCUSSIONS);
  const [stats, setStats] = useState(INITIAL_COMMUNITY_STATS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Toggle Like on Discussion
  const handleLikeToggle = (discussionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setDiscussions((prev) =>
      prev.map((item) => {
        if (item.id === discussionId) {
          const userLiked = !item.userLiked;
          const likesCount = userLiked ? item.likesCount + 1 : item.likesCount - 1;
          const updated = { ...item, userLiked, likesCount };
          if (activeDiscussion?.id === discussionId) {
            setActiveDiscussion(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Share Discussion
  const handleShare = (discussion: Discussion, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#community`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${discussion.title} - IULS Academic Community: ${url}`);
      showToast("✓ Discussion link copied to clipboard!");
    } else {
      showToast("✓ Discussion link ready to share!");
    }
  };

  // Create & Publish new Discussion
  const handleCreateDiscussion = (newDiscussionData: Omit<Discussion, "id" | "likesCount" | "userLiked" | "commentsCount" | "comments" | "createdAt">) => {
    const newDiscussion: Discussion = {
      ...newDiscussionData,
      id: `disc-${Date.now()}`,
      createdAt: "Just now",
      likesCount: 1,
      userLiked: true,
      commentsCount: 0,
      comments: []
    };

    setDiscussions((prev) => [newDiscussion, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalDiscussions: prev.totalDiscussions + 1,
      totalResources: newDiscussion.attachments ? prev.totalResources + newDiscussion.attachments.length : prev.totalResources
    }));

    showToast("Your academic discussion was published to the feed.");
  };

  // Add Comment / Peer Response to Active Discussion
  const handleAddComment = (
    discussionId: string,
    content: string,
    authorName: string,
    authorRole: UserRole
  ) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      discussionId,
      authorName,
      authorRole,
      createdAt: "Just now",
      content,
      likesCount: 0,
      userLiked: false
    };

    setDiscussions((prev) =>
      prev.map((item) => {
        if (item.id === discussionId) {
          const updatedComments = [...item.comments, newComment];
          const updated = {
            ...item,
            commentsCount: item.commentsCount + 1,
            comments: updatedComments
          };
          if (activeDiscussion?.id === discussionId) {
            setActiveDiscussion(updated);
          }
          return updated;
        }
        return item;
      })
    );

    showToast("✓ Your response has been posted.");
  };

  return (
    <div className="community-page-wrapper">
      {/* Universal Top Navigation */}
      <Navigation profileName={profileName} />

      <main id="community" className="academic-community-page">
        {/* 1. Community Hero Section */}
        <CommunityHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={() => setIsCreateModalOpen(true)}
          stats={stats}
        />

        {/* 2. Academic Categories */}
        <CommunityCategories
          categories={ACADEMIC_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 3. Main Community Layout: Feed + Sidebar */}
        <div className="community-main-layout">
          <div className="community-feed-column">
            <DiscussionList
              discussions={discussions}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectDiscussion={(disc) => setActiveDiscussion(disc)}
              onLikeToggle={(id, e) => handleLikeToggle(id, e)}
              onShare={(disc, e) => handleShare(disc, e)}
              onResetFilters={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
            />
          </div>

          <CommunitySidebar
            popularTopics={POPULAR_TOPICS}
            trendingDiscussions={discussions}
            contributors={TOP_CONTRIBUTORS}
            onSelectTopic={(topic) => setSearchQuery(topic)}
            onSelectDiscussion={(disc) => setActiveDiscussion(disc)}
          />
        </div>

        {/* 4. Create Discussion Modal */}
        <CreateDiscussion
          categories={ACADEMIC_CATEGORIES}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateDiscussion}
        />

        {/* 5. Detailed Discussion View Modal */}
        {activeDiscussion && (
          <DiscussionDetail
            discussion={activeDiscussion}
            onClose={() => setActiveDiscussion(null)}
            onLikeToggle={(id) => handleLikeToggle(id)}
            onAddComment={handleAddComment}
          />
        )}

        {/* Toast Notification */}
        {toastMessage && <div className="community-toast">{toastMessage}</div>}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

export default Community;
