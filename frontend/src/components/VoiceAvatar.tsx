'use client';

import React, { useEffect, useState, useRef } from 'react';

interface VoiceAvatarProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing';
  icon?: string;
  color?: string;
  subtitle?: string;
  videoSrc?: string;
}

export default function VoiceAvatar({ state, color = 'var(--accent-purple)', subtitle, videoSrc = '/avatar1.mp4' }: VoiceAvatarProps) {
  const [scale, setScale] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'speaking') {
      interval = setInterval(() => setScale(1 + Math.random() * 0.05), 150);
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
    } else {
      setScale(1);
      if (videoRef.current) {
        videoRef.current.pause();
        // Reset to first frame when idle to act as a still image
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
      position: 'relative'
    }}>
      {/* Outer Glow Effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${state === 'speaking' ? scale : 1})`,
        width: '100%',
        maxWidth: '960px',
        aspectRatio: '16/9',
        background: `radial-gradient(ellipse at center, ${color}33 0%, transparent 70%)`,
        transition: 'opacity 0.4s ease, transform 0.2s ease-out',
        opacity: state !== 'idle' ? 1 : 0.4,
        zIndex: 0,
      }} />

      {/* Core Video Player Container */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        aspectRatio: '16/9',
        borderRadius: '16px',
        background: '#050505',
        border: `2px solid ${state === 'speaking' ? color : 'var(--border-subtle)'}`,
        boxShadow: state !== 'idle' ? `0 0 ${30 * scale}px ${color}33` : '0 10px 40px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        transition: 'box-shadow 0.2s ease, border-color 0.4s ease',
      }}>
        {/* The Realistic Human Video */}
        <video 
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#0a0a0a',
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 70%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Professional Rolling Subtitles Overlay (Max 2 Lines) */}
        <div style={{
          position: 'absolute',
          bottom: '6%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '650px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}>
          {subtitle && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}>
              <span style={{
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '4px 16px',
                borderRadius: '4px',
                fontSize: '1rem',
                lineHeight: 1.4,
                fontWeight: 500,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,1)',
                fontFamily: '"Inter", "Roboto", sans-serif',
                textAlign: 'center',
                maxHeight: '3.2em', // Approximately 2 lines
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
