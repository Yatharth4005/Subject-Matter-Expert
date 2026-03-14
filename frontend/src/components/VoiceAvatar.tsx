'use client';

import React, { useEffect, useState, useRef } from 'react';

interface VoiceAvatarProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing';
  icon?: string;
  color?: string;
  subtitle?: string;
  videoSrc?: string;
}

export default function VoiceAvatar({ state, color = 'var(--accent-sage)', subtitle, videoSrc = '/avatar1.mp4' }: VoiceAvatarProps) {
  const [scale, setScale] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'speaking') {
      interval = setInterval(() => setScale(1 + Math.random() * 0.08), 120);
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
    } else {
      setScale(1);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    return () => clearInterval(interval);
  }, [state]);

  return (
    <div className="voice-avatar-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Immersive Depth Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${state === 'speaking' ? scale : 1})`,
        width: '130%',
        maxWidth: '900px',
        aspectRatio: '1',
        background: `radial-gradient(circle at center, ${color}1a 0%, transparent 65%)`,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: state !== 'idle' ? 1 : 0.4,
        zIndex: 0,
      }} />

      {/* Expert Frame */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '16/9',
        borderRadius: 'var(--radius-xl)',
        background: '#000',
        border: `3px solid ${state === 'speaking' ? color : 'var(--border-subtle)'}`,
        boxShadow: state === 'speaking' ? 'var(--shadow-xl)' : 'var(--shadow-lg)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <video 
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: state === 'idle' ? 0.6 : 1,
            transition: 'opacity 0.6s'
          }}
        />
        
        {/* Subtle Vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(26, 36, 33, 0.2) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Floating Subtitle Portal */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {subtitle && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.2rem',
              lineHeight: 1.4,
              fontWeight: 400,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              animation: 'subtitle-enter 0.3s ease-out',
              maxHeight: '120px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}>
              {/* Show the most recent part of the subtitle */}
              {subtitle.length > 200 ? '...' + subtitle.slice(-200) : subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
