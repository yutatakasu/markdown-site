'use client';

import { useState } from 'react';
import type { Article, Highlight } from '@/lib/types';

interface ExportButtonProps {
  article: Article & { highlights: Highlight[] };
}

export function ExportButton({ article }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      // Generate single markdown file with all content
      const markdown = generateMarkdown(article);
      const filename = `${sanitizeFilename(article.title)}.md`;

      // Download as markdown file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export article');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="btn"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? 'Exporting...' : 'Export'}
    </button>
  );
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

function generateMarkdown(article: Article & { highlights: Highlight[] }): string {
  const lines: string[] = [];

  // Header and metadata
  lines.push(`# ${article.title}`);
  lines.push('');
  lines.push(`**Source:** [${article.domain}](${article.url})`);
  lines.push(`**Saved:** ${new Date(article.created_at).toLocaleDateString()}`);

  if (article.tags.length > 0) {
    lines.push(`**Tags:** ${article.tags.join(', ')}`);
  }

  lines.push('');

  // Summary section
  if (article.summary) {
    lines.push('## Summary');
    lines.push('');
    lines.push(article.summary);
    lines.push('');
  }

  // Highlights section
  if (article.highlights.length > 0) {
    lines.push('## Highlights');
    lines.push('');

    for (const highlight of article.highlights) {
      lines.push(`> ${highlight.selected_text}`);
      lines.push('');

      if (highlight.comment && highlight.comment !== 'Highlighted') {
        lines.push(`**Note:** ${highlight.comment}`);
        lines.push('');
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('*Exported from Active Reading Clipper*');

  return lines.join('\n');
}
