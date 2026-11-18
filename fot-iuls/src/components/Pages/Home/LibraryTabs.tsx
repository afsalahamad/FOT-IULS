
import { useState } from "react";
import "./LibraryTabs.css";

const tabs = [
  "Featured Books",
  "Featured Research",
  "New Arrivals",
  "Popular"
];

function LibraryTabs() {
  const [activeTab, setActiveTab] =
    useState("Featured Books");

  return (
    <div className="library-tabs-container">
      <div className="library-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={
              activeTab === tab
                ? "library-tab active"
                : "library-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <a href="/library" className="view-all">
        View All →
      </a>
    </div>
  );
}

export default LibraryTabs;
