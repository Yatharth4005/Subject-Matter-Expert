'use client';

interface WebDisplayPanelProps {
  screenshotUrl?: string;
  pageUrl?: string;
  summary?: string;
}

export default function WebDisplayPanel({
  screenshotUrl,
  pageUrl,
  summary,
}: WebDisplayPanelProps) {
  if (!screenshotUrl) {
    return (
      <div className="sidebar-section">
        <h4 className="sidebar-section__title">Web Display</h4>
        <div
          className="web-display"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌐</div>
            <p>Ask the agent to show you something from the web</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-section">
      <h4 className="sidebar-section__title">Web Display</h4>
      <div className="web-display">
        <img
          className="web-display__screenshot"
          src={screenshotUrl}
          alt="Web content screenshot"
        />
        {pageUrl && (
          <div className="web-display__url">{pageUrl}</div>
        )}
      </div>
      {summary && (
        <p
          style={{
            marginTop: 'var(--space-md)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}
