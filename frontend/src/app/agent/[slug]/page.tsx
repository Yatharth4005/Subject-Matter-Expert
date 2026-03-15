'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AGENTS, BACKEND_URL } from '@/lib/constants';
import { Message, WSMessage } from '@/types';
import VoiceAvatar from '@/components/VoiceAvatar';
import MicButton from '@/components/MicButton';
import VideoUpload from '@/components/VideoUpload';
import WebDisplayPanel from '@/components/WebDisplayPanel';
import SuggestionsSidebar from '@/components/SuggestionsSidebar';
import { SuggestionItem } from '@/types';

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const agent = AGENTS.find((a) => a.slug === slug);

  // Component State
  const [messages, setMessages] = useState<Message[]>([]);
  const [webScreenshot, setWebScreenshot] = useState<string>();
  const [webUrl, setWebUrl] = useState<string>();
  const [webSummary, setWebSummary] = useState<string>();
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  // Streaming & Buffer State
  const spokenSentencesRef = useRef<Set<string>>(new Set());
  const currentSentenceBufferRef = useRef<string>('');

  const speakChunk = useCallback((text: string, isLast: boolean = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = 
      voices.find(v => v.name.includes('Google US English')) || 
      voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen')) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices[0];

    // Clean markdown for speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/https?:\/\/[^\s]+/g, 'a link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; 
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setAvatarState('speaking');
    };

    utterance.onend = () => {
      if (isLast) setAvatarState('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleMessage = useCallback((msg: WSMessage) => {
    if (msg.type === 'audio_response' || msg.type === 'text_response') {
      const text = msg.text || msg.content || '';
      
      // Handle streaming chunks for near-instant feedback
      if (msg.is_chunk) {
        setAvatarState('speaking');
        setCurrentSubtitle(prev => {
          const combined = prev.includes('Processing') ? text : prev + text;
          // Keep only the last 500 characters for the scrolling window
          return combined.length > 500 ? combined.slice(-500) : combined;
        });

        // Add to buffer and check for complete sentences
        currentSentenceBufferRef.current += text;
        const buffer = currentSentenceBufferRef.current;
        
        // Find complete sentences using regex
        const sentences = buffer.match(/[^.!?\n]+[.!?\n]*/g);
        if (sentences) {
          sentences.forEach(s => {
            const trimmed = s.trim();
            if (trimmed && !spokenSentencesRef.current.has(trimmed)) {
              spokenSentencesRef.current.add(trimmed);
              speakChunk(trimmed);
              // Remove from buffer
              currentSentenceBufferRef.current = currentSentenceBufferRef.current.replace(s, '');
            }
          });
        }
        return;
      }

      // Final message (e.g. for chat history logging or non-streamed responses)
      const newMsg: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        contentType: msg.type === 'audio_response' ? 'audio' : 'text',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);

      if (text.includes('Processing your voice')) {
        setAvatarState('processing');
        setCurrentSubtitle('Processing your request...');
        return;
      }

      // Reset for next interaction
      spokenSentencesRef.current.clear();
      currentSentenceBufferRef.current = '';
    } else if (msg.type === 'suggestions') {
      setSuggestions(msg.items || []);
      if (!showSuggestions) {
        // Automatically show badge or notify user if sidebar is closed
      }
    } else if (msg.type === 'web_content') {
      setWebScreenshot(msg.screenshot);
      setWebUrl(msg.url);
      setWebSummary(msg.summary);
      setCurrentSubtitle('I found something on the web for you.');
      speakChunk("I found some relevant information on the web. Let me show you.");
    } else if (msg.type === 'story_chunk') {
      setCurrentSubtitle(msg.content || '');
      setAvatarState('speaking');
    } else if (msg.type === 'error') {
      console.error('[Agent Error]:', msg.content);
      setAvatarState('idle');
    }
  }, [speakChunk]);

  const { isConnected, connectionError, sendMessage, retry } = useWebSocket({
    agentSlug: slug,
    onMessage: handleMessage,
  });

  const handleAudioData = useCallback(
    (audioBase64: string, mimeType: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      spokenSentencesRef.current.clear();
      currentSentenceBufferRef.current = '';
      setCurrentSubtitle('');
      setSuggestions([]); // Clear suggestions for new query

      sendMessage({ type: 'audio', data: audioBase64, mimeType });
      setAvatarState('processing');
    },
    [sendMessage],
  );

  const handleStopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    spokenSentencesRef.current.clear();
    currentSentenceBufferRef.current = '';
    setAvatarState('idle');
    setCurrentSubtitle('');
  }, []);

  const handleVideoUpload = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      sendMessage({ type: 'video_url', url });
      setAvatarState('processing');
    },
    [sendMessage],
  );

  if (!agent) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h2>Agent not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The agent &quot;{slug}&quot; does not exist.</p>
        <button
          onClick={() => router.push('/')}
          className="login-btn"
          style={{ maxWidth: 200, margin: '24px auto' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SuggestionsSidebar 
        items={suggestions} 
        isOpen={showSuggestions} 
        onClose={() => setShowSuggestions(false)} 
      />
      {connectionError && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--accent-rose)',
        }}>
          <span>⚠️ {connectionError}</span>
          <button onClick={retry} style={{
            padding: '4px 12px',
            background: 'rgba(244, 63, 94, 0.15)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--accent-rose)',
          }}>
            Retry
          </button>
        </div>
      )}
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '10px', opacity: 0.5, color: 'var(--text-muted)', zIndex: 9999 }}>
        Debug: {BACKEND_URL} | {isConnected ? 'Connected' : 'Connecting...'}
      </div>
      <div className="immersive-layout" style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // adjust for padding
        position: 'relative'
      }}>
        {/* Floating Call Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2.5rem 3rem',
          zIndex: 100,
          background: 'linear-gradient(to bottom, var(--bg-primary), transparent)',
          transition: 'all 0.5s ease',
          opacity: isImmersive ? 0.4 : 1,
        }} onMouseEnter={(e) => isImmersive && (e.currentTarget.style.opacity = '1')} 
           onMouseLeave={(e) => isImmersive && (e.currentTarget.style.opacity = '0.4')}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              className="agent-page__back" 
              onClick={() => router.push('/')}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-md)',
                fontSize: '1.2rem'
              }}
            >
              ←
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{agent.displayName}</h1>
              <div className="agent-page__status" style={{ fontSize: '0.75rem' }}>
                {isConnected ? 'LIVE SESSION' : 'CONNECTING...'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
             <button 
              onClick={() => setIsImmersive(!isImmersive)}
              style={{
                padding: '10px 24px',
                background: isImmersive ? 'var(--accent-sage)' : 'var(--bg-card)',
                color: isImmersive ? '#fff' : 'var(--text-primary)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.3s'
              }}
            >
              {isImmersive ? 'Show Chat' : 'Go Immersive'}
            </button>
            <button 
              onClick={() => router.push('/')}
              style={{
                padding: '10px 24px',
                background: 'var(--accent-clay)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              End Call
            </button>
          </div>
        </div>

        {/* The Stage */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 2rem',
          marginTop: '60px',
          background: isImmersive ? 'var(--bg-sage-glow)' : 'transparent',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRadius: isImmersive ? 'var(--radius-xl)' : '0',
          margin: isImmersive ? '1rem' : '0',
          marginBottom: '8rem', // Extra space for the action bar
          overflow: 'hidden',
          position: 'relative'
        }}>
          <VoiceAvatar 
            state={avatarState} 
            icon={agent.icon} 
            subtitle={currentSubtitle} 
            videoSrc={agent.videoSrc || `/avatar${(AGENTS.indexOf(agent) % 3) + 1}.mp4`}
          />
        </div>

        {/* Media Overlay (Web/Video results) */}
        {(webScreenshot || webSummary) && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '2rem',
            width: '300px',
            maxHeight: '40vh',
            overflowY: 'auto',
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            zIndex: 60,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <WebDisplayPanel
              screenshotUrl={webScreenshot}
              pageUrl={webUrl}
              summary={webSummary}
            />
            <button
              onClick={() => { setWebScreenshot(undefined); setWebSummary(undefined); }}
              style={{ padding: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', marginTop: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Simplified Action Bar */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '580px',
          width: '90%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          padding: '0.75rem 1.75rem',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(24px)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          zIndex: 150,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isImmersive ? 0.9 : 1
        }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
           onMouseLeave={(e) => isImmersive && (e.currentTarget.style.opacity = '0.9')}>
          
          <button 
            onClick={() => document.getElementById('integrated-upload')?.click()}
            style={{ fontSize: '1.2rem', opacity: 0.5, transition: 'opacity 0.2s' }}
            title="Upload Content"
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
          >
            📎
          </button>
          <input 
            id="integrated-upload"
            type="file" 
            accept="video/*,image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoUpload(file);
            }}
            style={{ display: 'none' }}
          />

          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {avatarState === 'idle' && 'How can I help?'}
              {avatarState === 'listening' && 'Listening...'}
              {avatarState === 'processing' && 'Thinking...'}
              {avatarState === 'speaking' && 'Speaking...'}
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

          <MicButton onAudioData={handleAudioData} disabled={!isConnected} />
          
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{ fontSize: '1.2rem', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '50%' }}
          >
            📚
          </button>
        </div>
      </div>
    </div>
  );
}

function playAudioResponse(audioBase64: string) {
  try {
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(console.error);
    audio.onended = () => URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}
