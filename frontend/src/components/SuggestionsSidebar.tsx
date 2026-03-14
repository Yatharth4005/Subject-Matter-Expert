'use client';

import React from 'react';
import { SuggestionItem } from '@/types';

interface SuggestionsSidebarProps {
  items: SuggestionItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionsSidebar({ items, isOpen, onClose }: SuggestionsSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className={`suggestions-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Learning Resources</h3>
        <button onClick={onClose} className="close-sidebar">×</button>
      </div>
      
      <div className="sidebar-content">
        {items.length === 0 ? (
          <div className="no-suggestions">
            <p>Asking the teacher for resources...</p>
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        ) : (
          <div className="suggestions-list">
            {items.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`suggestion-card ${item.type}`}
              >
                <div className="card-icon">
                  {item.type === 'youtube' && <span className="icon">▶️</span>}
                  {item.type === 'doc' && <span className="icon">📄</span>}
                  {item.type === 'web' && <span className="icon">🌐</span>}
                </div>
                <div className="card-info">
                  <span className="item-label">{item.type.toUpperCase()}</span>
                  <h4>{item.title}</h4>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .suggestions-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 360px;
          height: 100vh;
          background: var(--bg-card);
          border-left: 1px solid var(--border-subtle);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-lg);
        }

        .suggestions-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 32px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h3 {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text-primary);
        }

        .close-sidebar {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-sidebar:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .suggestion-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .suggestion-card:hover {
          border-color: var(--border-medium);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-info {
          flex: 1;
        }

        .item-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-rose);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          display: block;
        }

        .card-info h4 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.4;
          color: var(--text-primary);
          font-weight: 500;
        }

        .no-suggestions {
          text-align: center;
          padding-top: 60px;
          color: var(--text-muted);
        }

        .loading-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 16px;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: var(--accent-rose);
          border-radius: 50%;
          animation: dotPulse 1.4s infinite;
          opacity: 0.3;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
