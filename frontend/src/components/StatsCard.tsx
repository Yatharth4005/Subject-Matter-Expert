'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  sparklineData: number[];
  icon: string;
  accentColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  sparklineData,
  icon,
  accentColor,
}: StatsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animated counter on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setAnimatedValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  // Build sparkline path
  const buildSparkline = () => {
    if (!sparklineData.length) return 'M0,32';
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    const width = 120;
    const height = 32;
    const stepX = width / (sparklineData.length - 1 || 1);

    const points = sparklineData.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  const isPositive = change >= 0;

  return (
    <div className="stats-card">
      <div className="stats-card__header">
        <div className="stats-card__icon">
          {icon}
        </div>
        <span className="stats-card__title">{title}</span>
      </div>
      <div className="stats-card__value">{animatedValue.toLocaleString()}</div>
      <span
        className={`stats-card__change ${
          isPositive ? 'stats-card__change--positive' : 'stats-card__change--negative'
        }`}
      >
        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontSize: '0.7rem' }}>
          vs last week
        </span>
      </span>
      <div className="stats-card__sparkline">
        <svg
          ref={svgRef}
          viewBox="0 0 120 32"
          fill="none"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d={buildSparkline()}
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={`${buildSparkline()} L120,32 L0,32 Z`}
            fill={`${accentColor}15`}
          />
        </svg>
      </div>
    </div>
  );
}
