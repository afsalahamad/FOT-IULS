import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import HeroBanner from "../components/Pages/Home/HeroBanner";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { BooksGrid } from "../components/Pages/Home/Books";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { fetchCatalogBooks } from "../lib/catalogService";
import { INITIAL_BOOKS } from "../data/booksData";
import type { BookItem } from "../types/book";
import type { Suggestion, Scope, SearchFilters } from "../components/SearchBar/types";
import "./Home.css";

interface HomeProps {
  profileName?: string;
  onSelectBook?: (bookId: string) => void;
}

export function Home({ profileName = "Guest", onSelectBook }: HomeProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<BookItem[]>(INITIAL_BOOKS.slice(0, 4));

  useEffect(() => {
    let active = true;
    void fetchCatalogBooks().then((loaded) => {
      if (active && loaded.length > 0) {
        setFeaturedBooks(loaded.slice(0, 4));
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
            <p>Access open-access university textbooks, downloadable PDFs, and AI-guided reading chapters.</p>
          </a>

          <a
            href={!isAuthenticated ? "#login" : isAdmin ? "#admin" : "#student-dashboard"}
            className="service-card"
          >
            <span className="service-card-tag">
              {isAdmin ? "Administration" : "Student workspace"}
            </span>
            <h3>{isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h3>
            <p>
              {isAdmin
                ? "Manage catalog textbooks, review student manuscripts, and oversee institutional roles."
                : "Submit research for review, save books, download PDFs, and keep cloud-synced study notes."}
            </p>
          </a>

          <a href="#research" className="service-card">
            <span className="service-card-tag">Publications</span>
            <h3>Research Archive</h3>
            <p>Peer-reviewed faculty publications, departmental preprints, and approved student papers.</p>
          </a>

          <a href="#community" className="service-card">
            <span className="service-card-tag">Collaboration</span>
            <h3>Academic Community</h3>
            <p>Multidisciplinary study circles, research discussions, and peer mentorship.</p>
          </a>
        </div>
      </section>

      {/* 4. University Discovery Search Console */}
      <section className="home-search-section" aria-label="Catalog Search">
        <div className="home-search-card">
          <div className="search-card-header">
            <span className="search-card-badge">Discovery Index</span>
            <h2>Search Catalog &amp; Academic Resources</h2>
            <p>
              Query books, authors, ISBNs, and subject areas using intelligent semantic search.
            </p>
          </div>

          <SearchBar
            placeholder="Search books, authors, subjects, or ISBNs (e.g. 'Machine Learning' or 'Allen Downey')..."
            onSearch={handleSearch}
            onSelect={handleSelectSuggestion}
          />

          <div className="search-quick-tags">
            <span className="quick-tag-label">Popular Searches:</span>
            {["Machine Learning", "Python", "Data Structures", "Statistics", "Bayesian", "Git"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="quick-tag-btn"
                onClick={() => handleQuickTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Open-Access Textbooks Showcase */}
      <section className="home-featured-section" aria-label="Featured Textbooks">
        <div className="home-featured-header">
          <div>
            <span className="home-section-badge">Curated Collection</span>
            <h2>Featured Open-Access Textbooks</h2>
            <p>Explore real computer science, mathematics, and engineering textbooks with built-in PDF viewer and AI Q&amp;A.</p>
          </div>
          <a href="#library" className="home-view-all-btn">
            Browse Full Catalog →
          </a>
        </div>

        <BooksGrid books={featuredBooks} onSelectBook={handleSelectBook} />
      </section>

      {/* 6. Academic Community Callout Banner */}
      <section className="community-banner-section">
        <div className="community-banner-card">
          <div className="community-banner-content">
            <h3>Connect with the IULS Academic Community</h3>
            <p>
              Collaborate with students, lecturers, and researchers across academic faculties. Share manuscripts, debate methodologies, and form dedicated study circles.
            </p>
          </div>
          <a href="#community" className="community-banner-btn">
            Explore Community Platform →
          </a>
        </div>
      </section>

      {/* 7. Institutional Standards & Trust Ribbon */}
      <section className="trust-standards-wrap" aria-label="Institutional Standards">
        <div className="trust-standards-grid">
          <div className="trust-card">
            <h4>Institutional Access</h4>
            <p>Secure 24/7 cloud-synced access to digital textbooks, saved reading lists, and study notes.</p>
          </div>
          <div className="trust-card">
            <h4>Peer-Reviewed Indexing</h4>
            <p>Curated open-access textbooks and admin-reviewed student scholarship with instant citations.</p>
          </div>
          <div className="trust-card">
            <h4>AI Reading &amp; Synthesis</h4>
            <p>Dual Text and PDF reading modes paired with live AI chapter Q&amp;A and structured summaries.</p>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default Home;
