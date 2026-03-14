'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WSMessage } from '@/types';
import { BACKEND_URL } from '@/lib/constants';

interface UseWebSocketOptions {
  agentSlug: string;
  onMessage: (msg: WSMessage) => void;
}

export function useWebSocket({ agentSlug, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCount = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retryCount.current >= maxRetries) {
      setConnectionError('Backend unavailable. Please start the backend server.');
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const url = `${BACKEND_URL}/ws/session/${agentSlug}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        retryCount.current = 0;
        console.log(`[WS] Connected to ${agentSlug}`);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          onMessage(msg);
        } catch {
          // Silently ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        const delay = Math.min(2000 * Math.pow(2, retryCount.current), 32000);
        retryCount.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // Silently handle — onclose will fire after this and handle reconnect
      };
    } catch {
      setIsConnecting(false);
      setConnectionError('Failed to create WebSocket connection.');
    }
  }, [agentSlug, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const retry = useCallback(() => {
    retryCount.current = 0;
    connect();
  }, [connect]);

  return { isConnected, isConnecting, connectionError, sendMessage, retry };
}
