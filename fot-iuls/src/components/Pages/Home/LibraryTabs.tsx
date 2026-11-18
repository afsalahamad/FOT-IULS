import { useState } from "react";
import "./LibraryTabs.css";

const TABS = [
  "Featured Books",
  "Featured Research",
  "New Arrivals",
  "Popular"
] as const;

export type TabType = typeof TABS[number] | "All";

interface LibraryTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onViewAll?: () => void;
}

function LibraryTabs({
  activeTab: controlledTab,
  onTabChange,
  onViewAll,
}: LibraryTabsProps) {
  const [internalTab, setInternalTab] = useState("Featured Books");

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleSelectTab = (tab: string) => {
    if (controlledTab === undefined) {
      setInternalTab(tab);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewAll) {
      onViewAll();
    } else {
      handleSelectTab("All");
    }
  };

  return (
    <div className="library-tabs-container">
      <div className="library-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={currentTab === tab}
            className={
              currentTab === tab
                ? "library-tab active"
                : "library-tab"
            }
            onClick={() => handleSelectTab(tab)}
          >
            {tab}
          </button>
        ))}
        {currentTab === "All" && (
          <button
            type="button"
            role="tab"
            aria-selected={true}
            className="library-tab active"
            onClick={() => handleSelectTab("All")}
          >
            All Items
          </button>
        )}
      </div>

      <a
        href="#library"
        className="view-all"
        onClick={handleViewAllClick}
      >
        View All →
      </a>
    </div>
  );
}

export default LibraryTabs;
