'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AGENTS } from '@/lib/constants';
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
          if (prev.includes('Processing')) return text;
          return prev + text;
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
    (audioBase64: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      spokenSentencesRef.current.clear();
      currentSentenceBufferRef.current = '';
      spokenSentencesRef.current.clear();
      currentSentenceBufferRef.current = '';
      setCurrentSubtitle('');
      setSuggestions([]); // Clear suggestions for new query

      sendMessage({ type: 'audio', data: audioBase64 });
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
      <div className="immersive-layout" style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // adjust for padding
        position: 'relative'
      }}>
        {/* Header (Overlaid) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          zIndex: 50,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent)'
        }}>
          <button className="agent-page__back" onClick={() => router.push('/')} id="back-btn">
            ← Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              {agent.displayName} Agent
            </span>
            <span className="agent-page__status" style={connectionError ? { color: 'var(--accent-rose)' } : undefined}>
              {isConnected ? 'LIVE' : connectionError ? 'Disconnected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Center: Voice Avatar */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0 2rem',
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
            background: 'var(--bg-card)',
            backdropFilter: 'blur(30px)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '1rem',
            zIndex: 60,
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
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

        {/* Unified Bottom Action Center (Single Bar) */}
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '780px',
          padding: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 100
        }}>
          {/* End Session Row (Subtle) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => router.push('/')}
              style={{
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              End session
            </button>
          </div>

          {/* Combined Action Bar */}
          <div style={{
            background: 'rgba(15, 15, 18, 0.92)',
            backdropFilter: 'blur(40px)',
            border: `1px solid ${avatarState === 'listening' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '14px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'all 0.3s ease'
          }}>
            {/* Left: Attachment */}
            <button 
              onClick={() => document.getElementById('integrated-upload')?.click()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1.1rem',
                flexShrink: 0
              }}
              title="Attach media"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
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

            {/* Center: Status / Context */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', color: '#eee', fontWeight: 500 }}>
                {avatarState === 'idle' && 'How can I help you today?'}
                {avatarState === 'listening' && 'Listening... Speak now'}
                {avatarState === 'processing' && 'Thinking...'}
                {avatarState === 'speaking' && 'Agent is explaining...'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Voice & Media Assistant
              </span>
            </div>

            {/* Right: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <button 
                onClick={() => setShowSuggestions(!showSuggestions)}
                style={{
                  padding: '6px 14px',
                  background: suggestions.length > 0 ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${suggestions.length > 0 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  color: suggestions.length > 0 ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span>📚</span>
                <span>Resources</span>
                {suggestions.length > 0 && (
                  <span style={{
                    background: '#8b5cf6',
                    color: '#fff',
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    marginLeft: '2px'
                  }}>{suggestions.length}</span>
                )}
              </button>

              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
              {avatarState === 'speaking' && (
                <button
                  onClick={handleStopSpeaking}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '10px',
                    color: '#ff4b6b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Stop
                </button>
              )}
              <div
                onMouseDown={() => setAvatarState('listening')} 
                onMouseUp={() => setAvatarState('processing')}
                onMouseLeave={() => setAvatarState(prev => prev === 'listening' ? 'idle' : prev)}
                onTouchStart={() => setAvatarState('listening')}
                onTouchEnd={() => setAvatarState('processing')}
              >
                <MicButton onAudioData={handleAudioData} disabled={!isConnected} />
              </div>
            </div>
          </div>
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
