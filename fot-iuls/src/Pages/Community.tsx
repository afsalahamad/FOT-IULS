import { useEffect, useMemo, useState } from "react";
import type { Discussion, UserRole } from "../types/community";
import {
  ACADEMIC_CATEGORIES,
  INITIAL_COMMUNITY_STATS,
  INITIAL_DISCUSSIONS,
  POPULAR_TOPICS,
  TOP_CONTRIBUTORS,
} from "../data/communityData";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CommunityHero from "../components/Community/CommunityHero";
import CommunityCategories from "../components/Community/CommunityCategories";
import DiscussionList from "../components/Community/DiscussionList";
import CommunitySidebar from "../components/Community/CommunitySidebar";
import CreateDiscussion from "../components/Community/CreateDiscussion";
import DiscussionDetail from "../components/Community/DiscussionDetail";
import { useAuth } from "../context/useAuth";
import {
  addDiscussionCommentInDb,
  createDiscussionInDb,
  fetchDiscussions,
  toggleDiscussionLikeInDb,
} from "../lib/communityService";
import "./Community.css";

interface CommunityProps {
  profileName?: string;
}

export function Community({ profileName = "Scholar User" }: CommunityProps) {
  const { user, profile, isAuthenticated, displayName } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>(INITIAL_DISCUSSIONS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDiscussions(user?.id).then((loaded) => {
      if (!active) return;
      setDiscussions(loaded);
      setActiveDiscussion((current) =>
        current ? loaded.find((d) => d.id === current.id) ?? null : null
      );
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const stats = useMemo(() => {
    const resourceCount = discussions.reduce(
      (sum, d) => sum + (d.attachments?.length ?? 0),
      0
    );
    return {
      ...INITIAL_COMMUNITY_STATS,
      totalDiscussions: INITIAL_COMMUNITY_STATS.totalDiscussions + Math.max(0, discussions.length - 4),
      totalResources: INITIAL_COMMUNITY_STATS.totalResources + Math.max(0, resourceCount - 5),
    };
  }, [discussions]);

  const defaultAuthorRole: UserRole =
    profile?.role === "lecturer"
      ? "Lecturer"
      : profile?.role === "researcher"
      ? "Researcher"
      : "Student";

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to start a new academic discussion.");
      window.location.hash = "#login";
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleLikeToggle = async (discussionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated || !user) {
      showToast("Sign in to endorse academic discussions.");
      return;
    }

    const target = discussions.find((d) => d.id === discussionId);
    if (!target) return;
    const currentlyLiked = Boolean(target.userLiked);

    // Optimistic UI update
    const applyUpdate = (liked: boolean) => {
      setDiscussions((prev) =>
        prev.map((item) => {
          if (item.id !== discussionId) return item;
          const likesCount = Math.max(0, item.likesCount + (liked ? 1 : -1));
          const updated = { ...item, userLiked: liked, likesCount };
          if (activeDiscussion?.id === discussionId) {
            setActiveDiscussion(updated);
          }
          return updated;
        })
      );
    };

    applyUpdate(!currentlyLiked);
    try {
      await toggleDiscussionLikeInDb(discussionId, user.id, currentlyLiked);
    } catch (error) {
      applyUpdate(currentlyLiked);
      showToast(error instanceof Error ? error.message : "Could not update endorsement.");
    }
  };

  const handleShare = (discussion: Discussion, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#community`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(`${discussion.title} - IULS Academic Community: ${url}`);
      showToast("✓ Discussion link copied to clipboard!");
    } else {
      showToast("✓ Discussion link ready to share!");
    }
  };

  const handleCreateDiscussion = async (
    newDiscussionData: Omit<
      Discussion,
      "id" | "likesCount" | "userLiked" | "commentsCount" | "comments" | "createdAt"
    >
  ) => {
    if (!user) {
      showToast("Please sign in to publish a discussion.");
      return;
    }

    try {
      const created = await createDiscussionInDb(user.id, newDiscussionData);
      setDiscussions((prev) => [created, ...prev]);
      showToast("Your academic discussion was published to Supabase.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not publish discussion.");
    }
  };

  const handleAddComment = async (
    discussionId: string,
    content: string,
    authorName: string,
    authorRole: UserRole
  ) => {
    if (!isAuthenticated || !user) {
      showToast("Please sign in to post a peer response.");
      return;
    }

    try {
      const createdComment = await addDiscussionCommentInDb(
        discussionId,
        user.id,
        content,
        authorName,
        authorRole
      );

      setDiscussions((prev) =>
        prev.map((item) => {
          if (item.id !== discussionId) return item;
          const updated = {
            ...item,
            commentsCount: item.commentsCount + 1,
            comments: [...item.comments, createdComment],
          };
          if (activeDiscussion?.id === discussionId) {
            setActiveDiscussion(updated);
          }
          return updated;
        })
      );

      showToast("✓ Your response has been saved.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not post response.");
    }
  };

  return (
    <div className="community-page-wrapper">
      <Navigation profileName={displayName !== "Guest" ? displayName : profileName} />

      <main id="community" className="academic-community-page">
        <CommunityHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={handleOpenCreate}
          stats={stats}
        />

        <CommunityCategories
          categories={ACADEMIC_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="community-main-layout">
          <div className="community-feed-column">
            <DiscussionList
              discussions={discussions}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectDiscussion={(disc) => setActiveDiscussion(disc)}
              onLikeToggle={(id, e) => void handleLikeToggle(id, e)}
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

        <CreateDiscussion
          categories={ACADEMIC_CATEGORIES}
          isOpen={isCreateModalOpen}
          defaultAuthorName={displayName !== "Guest" ? displayName : "Scholar User"}
          defaultAuthorRole={defaultAuthorRole}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => void handleCreateDiscussion(data)}
        />

        {activeDiscussion && (
          <DiscussionDetail
            discussion={activeDiscussion}
            defaultAuthorName={displayName !== "Guest" ? displayName : "Scholar User"}
            defaultAuthorRole={defaultAuthorRole}
            isAuthenticated={isAuthenticated}
            onClose={() => setActiveDiscussion(null)}
            onLikeToggle={(id) => void handleLikeToggle(id)}
            onAddComment={(id, content, name, role) =>
              void handleAddComment(id, content, name, role)
            }
          />
        )}

        {toastMessage && <div className="community-toast">{toastMessage}</div>}
      </main>

      <Footer />
    </div>
  );
}

export default Community;
