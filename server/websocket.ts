import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { getListBySlug, upsertSession, deleteSession } from "./db";

interface ListUpdate {
  type: "item-added" | "item-updated" | "item-deleted" | "item-reordered" | "list-updated" | "session-joined" | "session-left";
  data: any;
  timestamp: number;
}

interface ClientData {
  sessionId: string;
  listSlug: string;
  listId?: number;
}

const clientData = new Map<string, ClientData>();

export function setupWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    /**
     * Join a list room
     */
    socket.on("join-list", async (data: { listSlug: string; sessionId: string }) => {
      try {
        const list = await getListBySlug(data.listSlug);
        if (!list) {
          socket.emit("error", { message: "List not found" });
          return;
        }

        // Store client data
        clientData.set(socket.id, {
          sessionId: data.sessionId,
          listSlug: data.listSlug,
          listId: list.id,
        });

        // Register session in database
        await upsertSession(list.id, data.sessionId, socket.handshake.headers["user-agent"]);

        // Join socket.io room
        socket.join(`list-${list.id}`);

        // Notify others that a user joined
        io.to(`list-${list.id}`).emit("user-joined", {
          sessionId: data.sessionId,
          timestamp: Date.now(),
        });

        // Send confirmation
        socket.emit("joined-list", {
          listId: list.id,
          listSlug: data.listSlug,
          timestamp: Date.now(),
        });

        console.log(`[WebSocket] Client ${socket.id} joined list ${data.listSlug}`);
      } catch (error) {
        console.error("[WebSocket] Error joining list:", error);
        socket.emit("error", { message: "Failed to join list" });
      }
    });

    /**
     * Broadcast item added
     */
    socket.on("item-added", (data: any) => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        const update: ListUpdate = {
          type: "item-added",
          data,
          timestamp: Date.now(),
        };
        io.to(`list-${client.listId}`).emit("update", update);
        console.log(`[WebSocket] Item added in list ${client.listId}`);
      }
    });

    /**
     * Broadcast item updated
     */
    socket.on("item-updated", (data: any) => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        const update: ListUpdate = {
          type: "item-updated",
          data,
          timestamp: Date.now(),
        };
        io.to(`list-${client.listId}`).emit("update", update);
        console.log(`[WebSocket] Item updated in list ${client.listId}`);
      }
    });

    /**
     * Broadcast item deleted
     */
    socket.on("item-deleted", (data: any) => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        const update: ListUpdate = {
          type: "item-deleted",
          data,
          timestamp: Date.now(),
        };
        io.to(`list-${client.listId}`).emit("update", update);
        console.log(`[WebSocket] Item deleted in list ${client.listId}`);
      }
    });

    /**
     * Broadcast items reordered
     */
    socket.on("items-reordered", (data: any) => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        const update: ListUpdate = {
          type: "item-reordered",
          data,
          timestamp: Date.now(),
        };
        io.to(`list-${client.listId}`).emit("update", update);
        console.log(`[WebSocket] Items reordered in list ${client.listId}`);
      }
    });

    /**
     * Broadcast list updated
     */
    socket.on("list-updated", (data: any) => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        const update: ListUpdate = {
          type: "list-updated",
          data,
          timestamp: Date.now(),
        };
        io.to(`list-${client.listId}`).emit("update", update);
        console.log(`[WebSocket] List updated: ${client.listId}`);
      }
    });

    /**
     * Handle disconnect
     */
    socket.on("disconnect", async () => {
      const client = clientData.get(socket.id);
      if (client?.listId) {
        // Delete session from database
        await deleteSession(client.sessionId);

        // Notify others that user left
        io.to(`list-${client.listId}`).emit("user-left", {
          sessionId: client.sessionId,
          timestamp: Date.now(),
        });

        console.log(`[WebSocket] Client ${socket.id} disconnected from list ${client.listId}`);
      }

      clientData.delete(socket.id);
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    /**
     * Handle errors
     */
    socket.on("error", (error) => {
      console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}
