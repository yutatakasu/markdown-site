import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { Article } from '@/lib/types';

const USER_ID = '00000000-0000-0000-0000-000000000001';

interface Props {
  params: { tag: string };
}

async function getArticlesByTag(tag: string): Promise<Article[]> {
  const supabase = createServerSupabaseClient();
  const decodedTag = decodeURIComponent(tag);

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', USER_ID)
    .contains('tags', [decodedTag])
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function FolderPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag);
  const articles = await getArticlesByTag(params.tag);

  return (
    <div>
      {/* Back link */}
      <Link href="/" className="back-link mb-8 inline-block">
        ← Back
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl text-[#1A1A1A] mb-2">{tag}</h1>
        <p className="text-[#9B9B9B]">
          {articles.length} article{articles.length === 1 ? '' : 's'}
        </p>
      </header>

      {/* Article list */}
      {articles.length === 0 ? (
        <div className="empty-state">
          <p>No articles with this tag.</p>
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
