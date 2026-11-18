import { useState } from "react";
import type { AcademicCategory, Attachment, Discussion, UserRole } from "../../types/community";
import "./CreateDiscussion.css";

interface CreateDiscussionProps {
  categories: AcademicCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDiscussion: Omit<Discussion, "id" | "likesCount" | "userLiked" | "commentsCount" | "comments" | "createdAt">) => void;
}

export function CreateDiscussion({
  categories,
  isOpen,
  onClose,
  onSubmit
}: CreateDiscussionProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "Technology & IT");
  const [authorName, setAuthorName] = useState("Scholar User");
  const [authorRole, setAuthorRole] = useState<UserRole>("Student");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please enter both a title and description for your discussion.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const attachments: Attachment[] = attachmentName.trim()
      ? [
          {
            id: `att-${Date.now()}`,
            name: attachmentName.trim(),
            size: "1.2 MB",
            type: attachmentName.endsWith(".pdf") ? "pdf" : "doc"
          }
        ]
      : [];

    onSubmit({
      title: title.trim(),
      category,
      authorName: authorName.trim() || "Academic Member",
      authorRole,
      content: content.trim(),
      tags: tags.length ? tags : [category.split(" ")[0]],
      attachments: attachments.length ? attachments : undefined
    });

    // Reset & close
    setTitle("");
    setContent("");
    setTagsInput("");
    setAttachmentName("");
    onClose();
  };

  return (
    <div className="create-discussion-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="create-discussion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>Start an Academic Discussion</span>
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form className="create-discussion-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="disc-title">Discussion Title *</label>
            <input
              id="disc-title"
              type="text"
              required
              placeholder="e.g., Comparing convergence rates of AdamW vs. SGD in sparse datasets..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category & Role Row */}
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="disc-category">Academic Category *</label>
              <select
                id="disc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    [{cat.icon}] {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="disc-role">Your Role *</label>
              <select
                id="disc-role"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value as UserRole)}
              >
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>
          </div>

          {/* Author Name */}
          <div className="form-group">
            <label htmlFor="disc-author">Author Display Name</label>
            <input
              id="disc-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          {/* Description / Content */}
          <div className="form-group">
            <label htmlFor="disc-content">Discussion Description & Research Inquiry *</label>
            <textarea
              id="disc-content"
              required
              rows={5}
              placeholder="Provide background context, methodology details, mathematical formulas, or specific questions for the academic community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="disc-tags">Academic Tags (comma-separated)</label>
            <input
              id="disc-tags"
              type="text"
              placeholder="e.g., Machine Learning, Optimization, PyTorch"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Attachment upload */}
          <div className="form-group">
            <label>Attach Academic Resource / Manuscript (Optional)</label>
            <input
              type="text"
              placeholder="File name (e.g. Methodology_Draft.pdf or Experiment_Data.csv)"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="modal-actions-bar">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-publish">
              Publish Discussion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDiscussion;
