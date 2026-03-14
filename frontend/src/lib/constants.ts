import { AgentConfig } from '@/types';

export const AGENTS: AgentConfig[] = [
  {
    slug: 'math',
    displayName: 'Mathematics',
    description: 'Algebra, calculus, geometry, statistics — step-by-step solutions and visual explanations.',
    icon: '🧮',
    color: 'var(--accent-purple)',
    category: 'subject',
    videoSrc: '/Actor_08_ref_calm.mp4',
  },
  {
    slug: 'physics',
    displayName: 'Physics',
    description: 'Mechanics, thermodynamics, optics, quantum physics — interactive problem solving.',
    icon: '⚛️',
    color: 'var(--accent-blue)',
    category: 'subject',
    videoSrc: '/XiaoLinShuo_gen_en.mp4',
  },
  {
    slug: 'chemistry',
    displayName: 'Chemistry',
    description: 'Organic, inorganic, physical chemistry — reactions, bonding, molecular analysis.',
    icon: '🧪',
    color: 'var(--accent-emerald)',
    category: 'subject',
    videoSrc: '/DengLijun_gen_en.mp4',
  },
  {
    slug: 'biology',
    displayName: 'Biology',
    description: 'Cell biology, genetics, ecology, anatomy — life sciences made vivid.',
    icon: '🧬',
    color: 'var(--accent-rose)',
    category: 'subject',
  },
  {
    slug: 'history',
    displayName: 'History',
    description: 'World history, civilizations, wars, cultural movements — stories from the past.',
    icon: '📜',
    color: 'var(--accent-amber)',
    category: 'subject',
  },
  {
    slug: 'cs',
    displayName: 'Computer Science',
    description: 'Algorithms, data structures, system design, programming — code & theory.',
    icon: '💻',
    color: 'var(--accent-cyan)',
    category: 'subject',
  },
  {
    slug: 'storyteller',
    displayName: 'Creative Storyteller',
    description: 'Rich visual narratives with inline illustrations — stories that come alive with images.',
    icon: '✨',
    color: 'var(--accent-pink)',
    category: 'creative',
  },
];

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'ws://localhost:8000';
