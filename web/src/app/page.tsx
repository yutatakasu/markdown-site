import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { Article, Folder } from '@/lib/types';

const USER_ID = '00000000-0000-0000-0000-000000000001';

async function getFolders(): Promise<Folder[]> {
  const supabase = createServerSupabaseClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('tags')
    .eq('user_id', USER_ID);

  if (!articles) return [];

  const tagCounts: Record<string, number> = {};
  for (const article of articles) {
    for (const tag of article.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, article_count]) => ({ tag, article_count }))
    .sort((a, b) => b.article_count - a.article_count);
}

async function getRecentArticles(): Promise<Article[]> {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function HomePage() {
  const [folders, articles] = await Promise.all([
    getFolders(),
    getRecentArticles(),
  ]);

  return (
    <div>
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl text-[#1A1A1A] mb-4">Reading Notes</h1>
        <p className="text-[#6B6B6B] leading-relaxed">
          Highlights and notes from articles I've read. Capturing thoughts as I learn.
        </p>
      </header>

      {/* Folder filters */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="filter-pill active">All</span>
          {folders.slice(0, 5).map((folder) => (
            <Link
              key={folder.tag}
              href={`/folders/${encodeURIComponent(folder.tag)}`}
              className="filter-pill"
            >
              {folder.tag}
            </Link>
          ))}
        </div>
      )}

      {/* Article list */}
      {articles.length === 0 ? (
        <div className="empty-state">
          <p>No reading notes yet.</p>
        </div>
      ) : (
        <div>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="article-row"
            >
              <span className="article-title">{article.title}</span>
              <span className="article-date">
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).replace(/\//g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
