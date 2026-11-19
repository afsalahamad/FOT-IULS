import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  downloadResearchPaperFile,
  fetchApprovedResearchPapers,
  type ResearchPaper,
} from "../lib/workspaceService";
import "./Research.css";

interface ResearchProps {
  profileName?: string;
}

export function Research({ profileName = "Guest" }: ResearchProps) {
  const [selectedField, setSelectedField] = useState<string>("All");
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchApprovedResearchPapers()
      .then((loaded) => {
        if (!active) return;
        setPapers(loaded);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load published research papers."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fields = ["All", ...new Set(papers.map((paper) => paper.field))];

  const filteredPapers =
    selectedField === "All"
      ? papers
      : papers.filter((p) => p.field === selectedField);

  const handleDownload = async (paper: ResearchPaper) => {
    try {
      await downloadResearchPaperFile(paper);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not download this paper."
      );
    }
  };

  const handleCite = async (paper: ResearchPaper) => {
    const citation = `${paper.authors} (${paper.year}). ${paper.title}. IULS Research Repository. ${paper.doi}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedId(paper.id);
      setTimeout(() => setCopiedId((prev) => (prev === paper.id ? null : prev)), 2200);
    } catch {
      window.alert(citation);
    }
  };

  return (
    <div className="home-container">
      <Navigation profileName={profileName} />
      <main>
        <section id="research" className="research-section" aria-label="IULS Academic Research">
          <div className="research-container">
            <div className="research-header">
              <span className="research-badge">Faculty &amp; Student Publications</span>
              <h1>University Research Repository</h1>
              <p>
                Explore peer-reviewed faculty publications, technical reports, and admin-approved student research papers.
              </p>
            </div>

            {errorMessage && (
              <p role="alert" className="research-storage-error">
                {errorMessage}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "24px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {fields.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedField(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "1px solid #cbd5e1",
                    background: selectedField === f ? "#2563EB" : "#ffffff",
                    color: selectedField === f ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: "center", color: "#64748b" }}>Loading research repository...</p>
            ) : (
              <div className="research-list">
                {filteredPapers.map((paper) => (
                  <article key={paper.id} className="research-paper-card">
                    <div className="research-paper-top">
                      <h3 className="research-paper-title">{paper.title}</h3>
                      <span className="research-paper-doi">{paper.doi}</span>
                    </div>
                    <div className="research-paper-authors">
                      {paper.authors} · {paper.year}
                    </div>
                    <p className="research-paper-abstract">{paper.abstract}</p>
                    <div className="research-paper-footer">
                      <div className="research-tags">
                        <span className="research-tag">{paper.field}</span>
                        <span style={{ color: "#64748b" }}>{paper.citations} Citations</span>
                      </div>
                      <div className="research-actions">
                        {paper.filePath && (
                          <button
                            type="button"
                            className="research-action-link"
                            onClick={() => void handleDownload(paper)}
                          >
                            Download Paper
                          </button>
                        )}
                        <button
                          type="button"
                          className="research-action-link"
                          onClick={() => void handleCite(paper)}
                        >
                          {copiedId === paper.id ? "✓ Citation Copied" : "Cite Paper"}
                        </button>
                        <a
                          href={`#library?${new URLSearchParams({ q: paper.field })}`}
                          className="research-action-link"
                        >
                          Find Related Books →
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Research;
