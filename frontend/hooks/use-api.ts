"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "mock_token_user@example.com";
  }
  return null;
}

// Generic fetch function
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Hook for fetching automations
export function useAutomations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/automations");
        setAutomations(data.automations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);

  const triggerAutomation = useCallback(async (automationId: string) => {
    try {
      const data = await apiFetch(`/api/automations/${automationId}/trigger`, {
        method: "POST",
      });
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { automations, loading, error, triggerAutomation };
}

// Hook for fetching dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/briefing/today");
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Hook for fetching orders
export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/shopify/orders");
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
}

// Hook for fetching inventory
export function useInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/shopify/inventory");
        setInventory(data.inventory || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return { inventory, loading, error };
}

// Hook for WebSocket connection
export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const wsUrl = API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");
    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { connected, events };
}

// Hook for running a goal (agent pipeline)
export function useRunGoal() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [progress, setProgress] = useState(0);

  const runGoal = useCallback(async (goal: string) => {
    try {
      setStatus("starting");
      const data = await apiFetch("/api/run-goal", {
        method: "POST",
        body: JSON.stringify({ goal }),
      });
      setJobId(data.id);
      setStatus("running");
      return data.id;
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }, []);

  return { runGoal, jobId, status, progress };
}
