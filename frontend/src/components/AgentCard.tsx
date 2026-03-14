'use client';

import Link from 'next/link';
import { AgentConfig } from '@/types';

interface AgentCardProps {
  agent: AgentConfig;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const categoryLabels: Record<string, string> = {
    subject: '📚 Subject Expert',
    creative: '✍️ Creative',
    navigator: '☸️ Navigator',
  };

  return (
    <Link href={`/agent/${agent.slug}`}>
      <div className="agent-card">
        <div className="agent-card__icon">
          {agent.icon}
        </div>
        <h3 className="agent-card__name">{agent.displayName}</h3>
        <p className="agent-card__description">{agent.description}</p>
        <span className="agent-card__category">
          {categoryLabels[agent.category]}
        </span>
        <span className="agent-card__cta">
          Start Session →
        </span>
      </div>
    </Link>
  );
}
