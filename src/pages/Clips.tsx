import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, USER_ID, type Article, type Folder } from "../lib/supabase";

export default function Clips() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch folders (tags)
      const { data: articlesForTags } = await supabase
        .from("articles")
        .select("tags")
        .eq("user_id", USER_ID);

      if (articlesForTags) {
        const tagCounts: Record<string, number> = {};
        for (const article of articlesForTags) {
          for (const tag of article.tags || []) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
        const folderList = Object.entries(tagCounts)
          .map(([tag, article_count]) => ({ tag, article_count }))
          .sort((a, b) => b.article_count - a.article_count);
        setFolders(folderList);
      }

      // Fetch articles
      let query = supabase
        .from("articles")
        .select("*")
        .eq("user_id", USER_ID)
        .order("created_at", { ascending: false });

      if (activeTag) {
        query = query.contains("tags", [activeTag]);
      }

      const { data } = await query;
      setArticles(data || []);
      setLoading(false);
    }

    fetchData();
  }, [activeTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, " ");
  };

  return (
    <div className="clips page-transition">
      {/* Header */}
      <header className="clips-header">
        <h1 className="clips-title">Clips</h1>
        <p className="clips-description">
          Highlights and notes from articles I've read. Capturing thoughts as I learn.
        </p>
      </header>

      {/* Folder filters */}
      {folders.length > 0 && (
        <div className="clips-filters">
          <button
            className={`clips-filter-pill ${activeTag === null ? "active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {folders.slice(0, 5).map((folder) => (
            <button
              key={folder.tag}
              className={`clips-filter-pill ${activeTag === folder.tag ? "active" : ""}`}
              onClick={() => setActiveTag(folder.tag)}
            >
              {folder.tag}
            </button>
          ))}
        </div>
      )}

      {/* Article list */}
      {loading ? (
        <div className="clips-loading">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="clips-empty">No clips yet.</div>
      ) : (
        <div className="clips-list">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/clips/${article.id}`}
              className="clips-article-row"
            >
              <span className="clips-article-title">{article.title}</span>
              <span className="clips-article-date">{formatDate(article.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
