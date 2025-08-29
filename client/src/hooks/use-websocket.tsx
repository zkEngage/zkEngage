import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  reconnectAttempts: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    reconnectAttempts: 0,
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  };

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wsUrl = getWebSocketUrl();
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: message }));
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        onDisconnect?.();

        // Attempt reconnection if not manually closed
        if (!event.wasClean && state.reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.current.onerror = (error) => {
        setState(prev => ({
          ...prev,
          error: "WebSocket connection failed",
          isConnecting: false,
        }));
        onError?.(error);
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to create WebSocket connection",
        isConnecting: false,
      }));
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    setState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));

    reconnectTimer.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  const disconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, "Manual disconnect");
      ws.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    }));
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
      return true;
    } else {
      toast({
        title: "Connection Error",
        description: "WebSocket is not connected. Message not sent.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !state.isConnected && !state.isConnecting) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isConnected, state.isConnecting]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    isReconnecting: state.reconnectAttempts > 0 && state.reconnectAttempts < maxReconnectAttempts,
  };
}

// Specialized hooks for different message types
export function useLeaderboardUpdates() {
  const [leaderboardData, setLeaderboardData] = useState(null);

  useWebSocket({
    onMessage: (message) => {
      if (message.type === "leaderboardUpdate") {
        setLeaderboardData(message.data);
      }
    },
  });

  return leaderboardData;
}

export function useTaskUpdates() {
  const [taskUpdates, setTaskUpdates] = useState<any[]>([]);

  useWebSocket({
    onMessage: (message) => {
      if (message.type === "taskCompleted" || message.type === "newTask") {
        setTaskUpdates(prev => [message.data, ...prev.slice(0, 9)]); // Keep last 10
      }
    },
  });

  return taskUpdates;
}

export function useUserUpdates() {
  const [userUpdates, setUserUpdates] = useState<any[]>([]);

  useWebSocket({
    onMessage: (message) => {
      if (message.type === "newUser" || message.type === "levelUp" || message.type === "achievementUnlocked") {
        setUserUpdates(prev => [message.data, ...prev.slice(0, 9)]); // Keep last 10
      }
    },
  });

  return userUpdates;
}
