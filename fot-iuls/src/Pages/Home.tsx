import Navigation from "../components/Navigation";
import HeroBanner from "../components/Pages/Home/HeroBanner";
import { SearchBar } from "../components/SearchBar/SearchBar";
import Footer from "../components/Footer";
import type { Suggestion, Scope, SearchFilters } from "../components/SearchBar/types";
import "./Home.css";

interface HomeProps {
  profileName?: string;
  onSelectBook?: (bookId: string) => void;
}

export function Home({ profileName = "Guest", onSelectBook }: HomeProps) {
  const handleSelectBook = (bookId: string) => {
    if (onSelectBook) {
      onSelectBook(bookId);
    } else {
      window.location.hash = `#reading?id=${bookId}`;
    }
  };

  const handleSearch = (query: string, scope: Scope, filters?: SearchFilters) => {
    const params = new URLSearchParams({ q: query, scope });
    if (filters?.language) params.set("language", filters.language);
    if (filters?.yearFrom) params.set("year_from", String(filters.yearFrom));
    window.location.hash = `#library?${params}`;
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.group === "Books") {
      handleSelectBook(suggestion.id);
    } else if (suggestion.group === "Authors") {
      window.location.hash = `#library?${new URLSearchParams({ q: suggestion.label, scope: "author" })}`;
    }
  };

  const handleQuickTagClick = (tag: string) => {
    window.location.hash = `#library?${new URLSearchParams({ q: tag })}`;
  };

  return (
    <div className="home-container">
      {/* 1. Global Navigation */}
      <Navigation profileName={profileName} />

      {/* 2. University Hero Section */}
      <section id="home" className="home-hero-wrap">
        <HeroBanner
          onExplore={() => {
            window.location.hash = "#library";
          }}
        />
      </section>

      {/* 3. Quick Academic Services Ribbon */}
      <section className="services-ribbon-wrap" aria-label="Library Services Overview">
        <div className="services-ribbon-grid">
          <a href="#library" className="service-card">
            <span className="service-card-tag">Collections</span>
            <h3>Library Catalog</h3>
            <p>Access 8,500+ textbooks, syllabi reserves, and peer-reviewed reference works.</p>
          </a>

          <a href="#student-dashboard" className="service-card">
            <span className="service-card-tag">Student workspace</span>
            <h3>Student Dashboard</h3>
            <p>Submit research for review, save books, download reading text, and keep study notes.</p>
          </a>

          <a href="#research" className="service-card">
            <span className="service-card-tag">Publications</span>
            <h3>Research Archive</h3>
            <p>Peer-reviewed faculty publications, departmental preprints, and graduate theses.</p>
          </a>

          <a href="#community" className="service-card">
            <span className="service-card-tag">Collaboration</span>
            <h3>Academic Community</h3>
            <p>Multidisciplinary study circles, research debates, and peer mentorship.</p>
          </a>
        </div>
      </section>

      {/* 4. University Discovery Search Console */}
      <section className="home-search-section" aria-label="Catalog Search">
        <div className="home-search-card">
          <div className="search-card-header">
            <span className="search-card-badge">Discovery Index</span>
            <h2>Search Catalog & Academic Resources</h2>
            <p>
              Query books, authors, ISBNs, and subject areas using intelligent semantic search.
            </p>
          </div>

          <SearchBar
            placeholder="Search books, authors, subjects, or ISBNs (e.g. 'Intro to ML' or 'Chen Wei')..."
            onSearch={handleSearch}
            onSelect={handleSelectSuggestion}
          />

          <div className="search-quick-tags">
            <span className="quick-tag-label">Popular Searches:</span>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Machine Learning")}
            >
              Machine Learning
            </button>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Deep Learning")}
            >
              Deep Learning
            </button>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Statistics")}
            >
              Statistics
            </button>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Climate Change")}
            >
              Climate Change
            </button>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Organic Chemistry")}
            >
              Organic Chemistry
            </button>
            <button
              type="button"
              className="quick-tag-btn"
              onClick={() => handleQuickTagClick("Python")}
            >
              Python
            </button>
          </div>
        </div>
      </section>

      {/* Academic Community Callout Banner */}
      <section className="community-banner-section">
        <div className="community-banner-card">
          <div className="community-banner-content">
            <h3>Connect with the IULS Academic Community</h3>
            <p>
              Collaborate with students, lecturers, and researchers across 8 academic faculties. Share manuscripts, debate methodologies, and form dedicated study circles.
            </p>
          </div>
          <a href="#community" className="community-banner-btn">
            Explore Community Platform →
          </a>
        </div>
      </section>

      {/* Institutional Standards & Trust Ribbon */}
      <section className="trust-standards-wrap" aria-label="Institutional Standards">
        <div className="trust-standards-grid">
          <div className="trust-card">
            <h4>Institutional Single Sign-On</h4>
            <p>Secure 24/7 access to digital library resources for all enrolled university students, researchers, and faculty.</p>
          </div>
          <div className="trust-card">
            <h4>Peer-Reviewed Indexing</h4>
            <p>Indexed in accordance with global academic metadata standards, DOI registration, and open-access licensing.</p>
          </div>
          <div className="trust-card">
            <h4>Research & Thesis Support</h4>
            <p>Integrated bibliographic citations, active recall study routines, and AI-assisted document synthesis.</p>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default Home;
