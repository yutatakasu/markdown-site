import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, type Article, type Highlight } from "../lib/supabase";

export default function ClipsArticle() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<(Article & { highlights: Highlight[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!id) return;
      setLoading(true);

      const { data: articleData } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (!articleData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: highlights } = await supabase
        .from("highlights")
        .select("*")
        .eq("article_id", id)
        .order("position", { ascending: true });

      setArticle({ ...articleData, highlights: highlights || [] });
      setLoading(false);
    }

    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleExport = () => {
    if (!article) return;

    let markdown = `# ${article.title}\n\n`;
    markdown += `Source: [${article.domain}](${article.url})\n`;
    markdown += `Date: ${formatDate(article.created_at)}\n\n`;

    if (article.summary) {
      markdown += `## Summary\n\n${article.summary}\n\n`;
    }

    if (article.highlights.length > 0) {
      markdown += `## Notes\n\n`;
      article.highlights.forEach((h) => {
        if (h.comment && h.comment !== "Highlighted") {
          markdown += `${h.comment}\n\n`;
        }
        markdown += `> "${h.selected_text}"\n\n`;
      });
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="clips-article page-transition">
        <div className="clips-loading">Loading...</div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="clips-article page-transition">
        <Link to="/clips" className="clips-back-link">
          <span className="clips-back-arrow">&larr;</span> Back
        </Link>
        <div className="clips-empty">Article not found.</div>
      </div>
    );
  }

  return (
    <div className="clips-article page-transition">
      {/* Back link */}
      <Link to="/clips" className="clips-back-link">
        <span className="clips-back-arrow">&larr;</span> Back
      </Link>

      {/* Article header */}
      <header className="clips-article-header">
        <h1 className="clips-article-page-title">{article.title}</h1>
        <div className="clips-article-meta">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="clips-article-source"
          >
            {article.domain}
          </a>
          <span className="clips-meta-separator">&middot;</span>
          <span>{formatDate(article.created_at)}</span>
          <span className="clips-meta-separator">&middot;</span>
          <span>{article.highlight_count} highlights</span>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="clips-tags">
            {article.tags.map((tag) => (
              <Link key={tag} to={`/clips?tag=${encodeURIComponent(tag)}`} className="clips-tag">
                {tag}
              </Link>
            ))}
          </div>
        )}

        <button onClick={handleExport} className="clips-export-btn">
          Export as Markdown
        </button>
      </header>

      {/* Summary */}
      {article.summary && (
        <section className="clips-section">
          <h2 className="clips-section-title">Summary</h2>
          <div className="clips-summary">
            {article.summary
              .split("\n")
              .filter((line) => line.trim())
              .map((line, i) => (
                <p key={i}>{line.trim().startsWith("•") ? line.trim() : `• ${line.trim()}`}</p>
              ))}
          </div>
        </section>
      )}

      {/* Highlights */}
      <section className="clips-section">
        <h2 className="clips-section-title">Notes ({article.highlights.length})</h2>

        {article.highlights.length === 0 ? (
          <p className="clips-empty-notes">No notes saved.</p>
        ) : (
          <div className="clips-highlights">
            {article.highlights.map((highlight) => (
              <div key={highlight.id} className="clips-highlight-card">
                <div className="clips-highlight-content">
                  <div className="clips-highlight-avatar">Y</div>
                  <div className="clips-highlight-body">
                    <div className="clips-highlight-meta">
                      <span className="clips-highlight-author">Yuta</span>
                      <span className="clips-meta-separator">&middot;</span>
                      <span className="clips-highlight-date">
                        {formatShortDate(article.created_at)}
                      </span>
                    </div>

                    {highlight.comment && highlight.comment !== "Highlighted" && (
                      <p className="clips-highlight-comment">{highlight.comment}</p>
                    )}

                    <div className="clips-quote-box">
                      <p className="clips-quote-text">"{highlight.selected_text}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
