import { useState } from "react";
import "./Research.css";

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  doi: string;
  abstract: string;
  field: string;
  citations: number;
}

const PAPERS: Paper[] = [
  {
    id: "p1",
    title: "Multivariate Sea-Level Projections and Storm-Surge Modeling for Port Resilience",
    authors: "Tomas Ibarra, H. Lindgren et al.",
    year: 2024,
    doi: "10.1016/j.ocecoaman.2024.1062",
    abstract: "Coupled hydrodynamic modeling analyzing extreme sea-level events across 24 international port systems, projecting critical infrastructure thresholds under high emissions pathways.",
    field: "Environmental Engineering",
    citations: 48
  },
  {
    id: "p2",
    title: "Sample-Efficient Deep Reinforcement Learning in Low-Data Regimes",
    authors: "Chen Wei, Maria Okafor",
    year: 2023,
    doi: "10.1109/TPAMI.2023.328901",
    abstract: "Proposes an auxiliary model-based dynamics network with contrastive state representations, achieving 4x faster convergence across robotics benchmarks.",
    field: "Artificial Intelligence",
    citations: 112
  },
  {
    id: "p3",
    title: "Comparative Stereoselectivity in Organocatalytic Asymmetric Synthesis",
    authors: "Elena Petrova, L. Marchand",
    year: 2022,
    doi: "10.1021/acs.joc.2c0182",
    abstract: "Investigating chiral proline catalysts in multicomponent Mannich reactions with automated DFT reaction coordinate scanning.",
    field: "Organic Chemistry",
    citations: 35
  }
];

export function Research() {
  const [selectedField, setSelectedField] = useState<string>("All");

  const fields = ["All", "Environmental Engineering", "Artificial Intelligence", "Organic Chemistry"];

  const filteredPapers = selectedField === "All"
    ? PAPERS
    : PAPERS.filter((p) => p.field === selectedField);

  return (
    <section id="research" className="research-section" aria-label="IULS Academic Research">
      <div className="research-container">
        <div className="research-header">
          <span className="research-badge">Faculty Publications</span>
          <h2>University Research Repository</h2>
          <p>Explore peer-reviewed publications, technical reports, and pre-prints authored by IULS faculty and scholars.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", justifyContent: "center", flexWrap: "wrap" }}>
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
                fontWeight: 500
              }}
            >
              {f}
            </button>
          ))}
        </div>

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
                  <button
                    type="button"
                    className="research-action-link"
                    onClick={() => alert(`Citation for: ${paper.title} (${paper.year}) copied!`)}
                  >
                    Cite Paper
                  </button>
                  <a
                    href="#library"
                    className="research-action-link"
                  >
                    Find in Catalog →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Research;
