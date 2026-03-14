'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '0.6rem', marginTop: '1.2rem', color: 'var(--text-primary)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--text-primary)' }}>{children}</h3>,
          p: ({ children }) => <p style={{ marginBottom: '0.6rem', lineHeight: 1.7 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.6rem' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '1.2rem', marginBottom: '0.6rem' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '0.4rem', lineHeight: 1.7 }}>{children}</li>,
          strong: ({ children }) => <strong style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{children}</strong>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code style={{
                background: 'var(--accent-rose-bg)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.9em',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-rose)',
              }}>
                {children}
              </code>
            ) : (
              <code style={{
                display: 'block',
                background: 'var(--bg-secondary)',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9em',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto',
                marginBottom: '1rem',
                lineHeight: 1.6,
                border: '1px solid var(--border-subtle)',
              }}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '4px solid var(--accent-rose)',
              paddingLeft: '1.2rem',
              margin: '1rem 0',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              background: 'var(--bg-secondary)',
              padding: '1rem 1.2rem',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            }}>
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', marginBottom: '0.6rem' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-tertiary)',
              borderBottom: '2px solid var(--border-medium)',
              textAlign: 'left',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
            }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{
              padding: '0.4rem 0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
