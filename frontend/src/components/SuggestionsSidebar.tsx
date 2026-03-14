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
          width: 320px;
          height: 100vh;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .suggestions-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: -0.01em;
        }

        .close-sidebar {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
          line-height: 1;
        }

        .close-sidebar:hover {
          color: white;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .suggestion-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          animation: slideIn 0.4s ease forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .suggestion-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .card-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .card-info {
          flex: 1;
        }

        .item-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          display: block;
        }

        .card-info h4 {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
        }

        .no-suggestions {
          text-align: center;
          padding-top: 60px;
          color: rgba(255, 255, 255, 0.4);
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 12px;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          animation: dotPulse 1.4s infinite;
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
