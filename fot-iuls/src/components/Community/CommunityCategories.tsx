import type { AcademicCategory } from "../../types/community";
import "./CommunityCategories.css";

interface CommunityCategoriesProps {
  categories: AcademicCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CommunityCategories({
  categories,
  selectedCategory,
  onSelectCategory
}: CommunityCategoriesProps) {
  return (
    <section className="categories-section" aria-label="Academic Discussion Categories">
      <div className="categories-header">
        <h2 className="categories-title">
          <span>Academic Categories</span>
        </h2>
        <button
          type="button"
          className={`all-categories-pill ${selectedCategory === null ? "active" : ""}`}
          onClick={() => onSelectCategory(null)}
        >
          {selectedCategory === null ? "Showing All Discussions" : "Show All Categories"}
        </button>
      </div>

      <div className="categories-grid" role="tablist">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <div
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              tabIndex={0}
              className={`category-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectCategory(isSelected ? null : cat.name);
                }
              }}
            >
              <div className="category-icon-wrap" aria-hidden="true">
                {cat.icon}
              </div>
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-description">{cat.description}</p>
              <div className="category-footer">
                <span>{cat.discussionsCount} topics</span>
                <span>{isSelected ? "Active" : "Explore →"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CommunityCategories;
