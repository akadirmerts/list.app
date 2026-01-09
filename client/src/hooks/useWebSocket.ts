import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { nanoid } from "nanoid";

interface UseWebSocketOptions {
  listSlug?: string;
  sessionId: string | null;
  onUpdate?: (update: any) => void;
  onUserJoined?: (sessionId: string) => void;
  onUserLeft?: (sessionId: string) => void;
  onError?: (error: any) => void;
}

export function useWebSocket({
  listSlug,
  sessionId,
  onUpdate,
  onUserJoined,
  onUserLeft,
  onError,
}: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  // const sessionIdRef = useRef<string>(nanoid()); // Removed internal ID

  // Use refs for callbacks to avoid re-connecting when parent component re-renders
  const onUpdateRef = useRef(onUpdate);
  const onUserJoinedRef = useRef(onUserJoined);
  const onUserLeftRef = useRef(onUserLeft);
  const onErrorRef = useRef(onError);

  // Update refs on every render
  onUpdateRef.current = onUpdate;
  onUserJoinedRef.current = onUserJoined;
  onUserLeftRef.current = onUserLeft;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!listSlug) return;

    // Create socket connection
    const socket = io(undefined, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Connect event
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      // Join the list room
      socket.emit("join-list", {
        listSlug,
        sessionId,
      });
    });

    // Joined list event
    socket.on("joined-list", (data) => {
      console.log("[WebSocket] Joined list:", data);
    });

    // Update event - broadcast from other clients
    socket.on("update", (update) => {
      // console.log("[WebSocket] Received update:", update);
      onUpdateRef.current?.(update);
    });

    // User joined event
    socket.on("user-joined", (data) => {
      console.log("[WebSocket] User joined:", data);
      onUserJoinedRef.current?.(data.sessionId);
    });

    // User left event
    socket.on("user-left", (data) => {
      console.log("[WebSocket] User left:", data);
      onUserLeftRef.current?.(data.sessionId);
    });

    // Error event
    socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      onErrorRef.current?.(error);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [listSlug, sessionId]);

  // Emit item added
  const emitItemAdded = useCallback((item: any) => {
    socketRef.current?.emit("item-added", item);
  }, []);

  // Emit item updated
  const emitItemUpdated = useCallback((item: any) => {
    socketRef.current?.emit("item-updated", item);
  }, []);

  // Emit item deleted
  const emitItemDeleted = useCallback((itemId: number) => {
    socketRef.current?.emit("item-deleted", { itemId });
  }, []);

  // Emit items reordered
  const emitItemsReordered = useCallback((updates: any) => {
    socketRef.current?.emit("items-reordered", updates);
  }, []);

  // Emit list updated
  const emitListUpdated = useCallback((list: any) => {
    socketRef.current?.emit("list-updated", list);
  }, []);

  return {
    isConnected: socketRef.current?.connected ?? false,
    emitItemAdded,
    emitItemUpdated,
    emitItemDeleted,
    emitItemsReordered,
    emitListUpdated,
  };
}
