import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

type GalleryItem =
  | { type: "image"; src: string; alt?: string }
  | { type: "quote"; text: string; author: string }
  | { type: "text"; text: string }
  | { type: "video"; url: string };

const galleryItems: GalleryItem[] = [];

export default function Gallery() {
  return (
    <div className="gallery-page">
      <nav className="gallery-nav">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
      </nav>

      <header className="gallery-header">
        <h1 className="gallery-title">Beautiful Things</h1>
        <p className="gallery-subtitle">A collection of images, quotes, and ideas that inspire me</p>
      </header>

      <div className="gallery-feed">
        {galleryItems.map((item, index) => (
          <GalleryCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match ? match[1] : null;
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return <div className="gallery-video-error">Invalid YouTube URL</div>;
  }

  return (
    <div className="gallery-video-wrapper">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  switch (item.type) {
    case "image":
      return (
        <div className="gallery-card gallery-card-image">
          <img src={item.src} alt={item.alt || ""} loading="lazy" />
        </div>
      );

    case "quote":
      return (
        <div
          className={`gallery-card gallery-card-quote gallery-card-copyable ${copied ? "gallery-card-copied" : ""}`}
          onClick={() => handleCopy(`"${item.text}" — ${item.author}`)}
        >
          <blockquote className="gallery-quote-text">"{item.text}"</blockquote>
          <cite className="gallery-quote-author">— {item.author}</cite>
          {copied && <span className="gallery-copied-badge">Copied!</span>}
        </div>
      );

    case "text":
      return (
        <div
          className={`gallery-card gallery-card-text gallery-card-copyable ${copied ? "gallery-card-copied" : ""}`}
          onClick={() => handleCopy(item.text)}
        >
          <p className="gallery-text">{item.text}</p>
          {copied && <span className="gallery-copied-badge">Copied!</span>}
        </div>
      );

    case "video":
      return (
        <div className="gallery-card gallery-card-video">
          <YouTubeEmbed url={item.url} />
        </div>
      );

    default:
      return null;
  }
}
