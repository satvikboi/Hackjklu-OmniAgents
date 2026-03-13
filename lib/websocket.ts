"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type WebSocketEvent =
  | { type: "agent_start"; agent: string; message: string; timestamp: string }
  | { type: "agent_complete"; agent: string; confidence: number; message: string; timestamp: string }
  | { type: "critic_reject"; score: number; reason: string; timestamp: string }
  | { type: "critic_approve"; final_confidence: number; message: string; timestamp: string }
  | { type: "notion_saved"; notion_url: string; timestamp: string }
  | { type: "pipeline_complete"; job_id: string; total_time_seconds: number; timestamp: string }
  | { type: "error"; agent: string; message: string; timestamp: string };

interface UseWebSocketOptions {
  jobId?: string;
  onMessage?: (event: WebSocketEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  jobId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!jobId) return;

    // For demo purposes, we'll simulate WebSocket
    // In production, replace with actual WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
    
    try {
      // Simulated WebSocket for frontend demo
      // Replace with: new WebSocket(`${wsUrl}/${jobId}`)
      const mockWs = createMockWebSocket(jobId);
      ws.current = mockWs as unknown as WebSocket;

      mockWs.onopen = () => {
        setIsConnected(true);
        onConnect?.();
      };

      mockWs.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data) as WebSocketEvent;
        setLastMessage(data);
        onMessage?.(data);
      };

      mockWs.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      mockWs.onerror = (error: Event) => {
        onError?.(error);
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      onError?.(error as Event);
    }
  }, [jobId, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, lastMessage, sendMessage, connect, disconnect };
}

// Mock WebSocket for demo purposes
function createMockWebSocket(jobId: string) {
  const events: WebSocketEvent[] = [
    { type: "agent_start", agent: "planner", message: "Breaking goal into subtasks...", timestamp: new Date().toISOString() },
    { type: "agent_complete", agent: "planner", confidence: 9.1, message: "Created 4 subtasks", timestamp: new Date().toISOString() },
    { type: "agent_start", agent: "researcher", message: "Searching web for market data...", timestamp: new Date().toISOString() },
    { type: "agent_complete", agent: "researcher", confidence: 8.5, message: "Found 12 sources", timestamp: new Date().toISOString() },
    { type: "agent_start", agent: "analyst", message: "Processing research findings...", timestamp: new Date().toISOString() },
    { type: "agent_complete", agent: "analyst", confidence: 8.8, message: "Extracted 8 key insights", timestamp: new Date().toISOString() },
    { type: "agent_start", agent: "writer", message: "Generating final report...", timestamp: new Date().toISOString() },
    { type: "agent_complete", agent: "writer", confidence: 9.0, message: "Report generated", timestamp: new Date().toISOString() },
    { type: "agent_start", agent: "critic", message: "Evaluating report quality...", timestamp: new Date().toISOString() },
    { type: "critic_approve", final_confidence: 9.2, message: "Report approved. Saving to Notion...", timestamp: new Date().toISOString() },
    { type: "notion_saved", notion_url: "https://notion.so/...", timestamp: new Date().toISOString() },
    { type: "pipeline_complete", job_id: jobId, total_time_seconds: 47, timestamp: new Date().toISOString() },
  ];

  let currentIndex = 0;
  let interval: NodeJS.Timeout;

  const mockWs = {
    readyState: WebSocket.CONNECTING,
    onopen: null as ((event: Event) => void) | null,
    onmessage: null as ((event: { data: string }) => void) | null,
    onclose: null as ((event: CloseEvent) => void) | null,
    onerror: null as ((event: Event) => void) | null,

    send: (data: string) => {
      console.log("Mock WebSocket send:", data);
    },

    close: () => {
      clearInterval(interval);
      mockWs.readyState = WebSocket.CLOSED;
      mockWs.onclose?.(new CloseEvent("close"));
    },
  };

  // Simulate connection
  setTimeout(() => {
    mockWs.readyState = WebSocket.OPEN;
    mockWs.onopen?.(new Event("open"));

    // Simulate receiving events every 2 seconds
    interval = setInterval(() => {
      if (currentIndex < events.length) {
        mockWs.onmessage?.({ data: JSON.stringify(events[currentIndex]) });
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  }, 500);

  return mockWs;
}

// WebSocket Context for global state
import { createContext, useContext, ReactNode } from "react";

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketEvent | null;
  subscribe: (jobId: string, callback: (event: WebSocketEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const subscribers = useRef<Map<string, ((event: WebSocketEvent) => void)[]>>(new Map());

  const subscribe = useCallback((jobId: string, callback: (event: WebSocketEvent) => void) => {
    if (!subscribers.current.has(jobId)) {
      subscribers.current.set(jobId, []);
    }
    subscribers.current.get(jobId)?.push(callback);

    return () => {
      const callbacks = subscribers.current.get(jobId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}
