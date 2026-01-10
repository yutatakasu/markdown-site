import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article, Highlight } from '@/lib/types';
import { ExportButton } from '@/components/ExportButton';

interface Props {
  params: { id: string };
}

async function getArticle(id: string): Promise<Article & { highlights: Highlight[] } | null> {
  const supabase = createServerSupabaseClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) return null;

  const { data: highlights } = await supabase
    .from('highlights')
    .select('*')
    .eq('article_id', id)
    .order('position', { ascending: true });

  return { ...article, highlights: highlights || [] };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      {/* Back link */}
      <Link href="/" className="back-link mb-8 inline-block">
        ← Back
      </Link>

      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-2xl text-[#1A1A1A] mb-3 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-[#9B9B9B] mb-4">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1A1A1A] underline"
          >
            {article.domain}
          </a>
          <span>·</span>
          <span>{new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>·</span>
          <span>{article.highlight_count} highlights</span>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/folders/${encodeURIComponent(tag)}`} className="tag">
                {tag}
              </Link>
            ))}
          </div>
        )}

        <ExportButton article={article} />
      </header>

      {/* Summary */}
      {article.summary && (
        <section className="mb-10">
          <h2 className="text-sm text-[#9B9B9B] uppercase tracking-wide mb-3">Summary</h2>
          <div className="text-[#1A1A1A] leading-relaxed space-y-2">
            {article.summary.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`}</p>
            ))}
          </div>
        </section>
      )}

      {/* Highlights */}
      <section>
        <h2 className="text-sm text-[#9B9B9B] uppercase tracking-wide mb-4">
          Notes ({article.highlights.length})
        </h2>

        {article.highlights.length === 0 ? (
          <p className="text-[#9B9B9B]">No notes saved.</p>
        ) : (
          <div className="space-y-4">
            {article.highlights.map((highlight) => (
              <div key={highlight.id} className="tweet-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-sm flex-shrink-0">
                    Y
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#1A1A1A]">Yuta</span>
                      <span className="text-[#9B9B9B]">·</span>
                      <span className="text-[#9B9B9B] text-sm">
                        {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {highlight.comment && highlight.comment !== 'Highlighted' && (
                      <p className="text-[#1A1A1A] leading-relaxed mb-3">
                        {highlight.comment}
                      </p>
                    )}

                    <div className="quote-box">
                      <p className="text-[#6B6B6B] text-sm leading-relaxed">
                        "{highlight.selected_text}"
                      </p>
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
