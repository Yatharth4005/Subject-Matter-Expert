'use client';

import { useState, useRef, useCallback } from 'react';

interface MicButtonProps {
  onAudioData: (audioBase64: string, mimeType: string) => void;
  disabled?: boolean;
}

export default function MicButton({ onAudioData, disabled }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const getMimeType = () => {
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
          'audio/wav',
        ];
        return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      };

      const mimeType = getMimeType();
      if (!mimeType) {
        throw new Error('No supported audio mime type found for MediaRecorder');
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Collect chunks — don't send yet
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // When recording stops, combine all chunks and send as one message
      mediaRecorder.onstop = async () => {
        const chunks = chunksRef.current;
        if (chunks.length === 0) return;

        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        onAudioData(base64, mimeType);
        chunksRef.current = [];
      };

      mediaRecorder.start(250); // Collect chunks every 250ms (but don't send)
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // This triggers onstop → sends combined audio
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      {isRecording && <AudioVisualizer />}
      <button
        className={`mic-btn ${isRecording ? 'mic-btn--active' : ''}`}
        onClick={toggleRecording}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        id="mic-button"
      >
        {isRecording ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
}

function AudioVisualizer() {
  return (
    <div className="audio-visualizer">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="audio-visualizer__bar" />
      ))}
    </div>
  );
}
