import { useState } from "react";
import "./BookCover.css";

interface BookCoverProps {
  src?: string | null;
  title: string;
  author?: string;
  gradient?: string;
  className?: string;
  imgClassName?: string;
  compact?: boolean;
}

const DEFAULT_GRADIENT = "linear-gradient(135deg, #102B46 0%, #1E4A74 55%, #2563EB 100%)";

export function BookCover({
  src,
  title,
  author,
  gradient,
  className = "",
  imgClassName = "",
  compact = false,
}: BookCoverProps) {
  const cleanSrc = src?.trim() || "";
  const [failedSrc, setFailedSrc] = useState<string>("");
  const showImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;

  if (showImage) {
    return (
      <img
        src={cleanSrc}
        alt={title}
        className={imgClassName || className || "book-cover-img"}
        loading="lazy"
        onError={() => setFailedSrc(cleanSrc)}
      />
    );
  }

  return (
    <div
      className={`book-cover-fallback ${compact ? "book-cover-fallback--compact" : ""} ${className}`}
      style={{ background: gradient || DEFAULT_GRADIENT }}
      role="img"
      aria-label={title}
    >
      <span className="book-cover-fallback-spine" aria-hidden="true" />
      <span className="book-cover-fallback-title">{title}</span>
      {!compact && author && <span className="book-cover-fallback-author">{author}</span>}
    </div>
  );
}

export default BookCover;
