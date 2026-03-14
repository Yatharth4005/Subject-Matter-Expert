'use client';

import { useEffect, useRef } from 'react';

interface UsageChartProps {
  data: number[];
  label?: string;
}

export default function UsageChart({ data, label = 'Sessions per day' }: UsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 10, right: 10, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const max = Math.max(...data, 1);
    const stepX = chartW / (data.length - 1);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '10px var(--font-sans)';
      ctx.textAlign = 'right';
      const val = Math.round(max - (max / 4) * i);
      ctx.fillText(val.toString(), padding.left - 8, y + 3);
    }

    // Build path
    const points = data.map((v, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (v / max) * chartH,
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(157, 23, 77, 0.1)');
    gradient.addColorStop(1, 'rgba(157, 23, 77, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cx, points[i - 1].y, cx, points[i].y, points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cx, points[i - 1].y, cx, points[i].y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = 'var(--accent-rose)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--accent-rose)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(157, 23, 77, 0.2)';
      ctx.lineWidth = 5;
      ctx.stroke();
    });

    // X-axis labels (show every 5th)
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '10px var(--font-sans)';
    ctx.textAlign = 'center';
    data.forEach((_, i) => {
      if (i % 5 === 0 || i === data.length - 1) {
        const x = padding.left + i * stepX;
        ctx.fillText(`${i + 1}`, x, height - 8);
      }
    });
  }, [data]);

  return (
    <div className="usage-chart">
      <div className="usage-chart__header">
        <h3 className="usage-chart__title">{label}</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 30 days</span>
      </div>
      <canvas ref={canvasRef} className="usage-chart__canvas" />
    </div>
  );
}
