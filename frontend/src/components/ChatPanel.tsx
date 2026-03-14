'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import StoryRenderer from './StoryRenderer';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatPanelProps {
  messages: Message[];
  isAgentTyping?: boolean;
  agentSlug?: string;
}

export default function ChatPanel({ messages, isAgentTyping, agentSlug }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-panel__messages">
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl) var(--space-lg)',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🎙️</div>
            <p style={{ fontSize: '0.95rem', marginBottom: 'var(--space-sm)' }}>
              Start a conversation
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Click the mic to speak, upload a video, or type your question.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message message--${msg.role}`}
          >
            {msg.contentType === 'image' && msg.mediaUrl ? (
              <div className="story-chunk--image">
                <img src={msg.mediaUrl} alt="Generated content" />
              </div>
            ) : agentSlug === 'storyteller' && msg.role === 'agent' ? (
              <StoryRenderer content={msg.content || ''} />
            ) : msg.role === 'agent' ? (
              <MarkdownRenderer content={msg.content || ''} />
            ) : (
              <span>{msg.content}</span>
            )}
          </div>
        ))}
        {isAgentTyping && (
          <div className="message message--agent" style={{ opacity: 0.6 }}>
            <div className="audio-visualizer" style={{ height: 16 }}>
              <div className="audio-visualizer__bar" style={{ height: 8 }} />
              <div className="audio-visualizer__bar" style={{ height: 12 }} />
              <div className="audio-visualizer__bar" style={{ height: 8 }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
