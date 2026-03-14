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
          h1: ({ children }) => <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.4rem', marginTop: '0.8rem', color: 'var(--text-primary)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem', marginTop: '0.6rem', color: 'var(--text-primary)' }}>{children}</h3>,
          p: ({ children }) => <p style={{ marginBottom: '0.6rem', lineHeight: 1.7 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.6rem' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '1.2rem', marginBottom: '0.6rem' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '0.3rem', lineHeight: 1.6 }}>{children}</li>,
          strong: ({ children }) => <strong style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{children}</strong>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code style={{
                background: 'rgba(139, 92, 246, 0.15)',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.85em',
                fontFamily: 'var(--font-geist-mono)',
                color: 'var(--accent-purple)',
              }}>
                {children}
              </code>
            ) : (
              <code style={{
                display: 'block',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85em',
                fontFamily: 'var(--font-geist-mono)',
                overflowX: 'auto',
                marginBottom: '0.6rem',
                lineHeight: 1.5,
              }}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '3px solid var(--accent-purple)',
              paddingLeft: '1rem',
              margin: '0.6rem 0',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
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
              padding: '0.5rem 0.75rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderBottom: '2px solid var(--border-subtle)',
              textAlign: 'left',
              fontWeight: 600,
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
