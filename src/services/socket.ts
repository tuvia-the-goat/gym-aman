// src/services/socket.ts
import { io, Socket } from "socket.io-client";
import { Entry } from "../types";
import { ServerToClientEvents, ClientToServerEvents } from "../types";

// Socket.IO instance with type definitions
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// Event callbacks
type EntryCallback = (entry: Entry) => void;
const entryCallbacks: EntryCallback[] = [];

export const socketService = {
  // Initialize socket connection
  init: () => {
    if (socket) return;

    // Connect to the same URL as your API but with Socket.IO
    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    // Set up event listeners
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Listen for new entries
    socket.on("newEntry", (entry: Entry) => {
      console.log("New entry received:", entry);
      // Notify all registered callbacks
      entryCallbacks.forEach((callback) => callback(entry));
    });
  },

  // Disconnect socket
  disconnect: () => {
    if (!socket) return;
    socket.disconnect();
    socket = null;
  },

  // Register callback for new entries
  onNewEntry: (callback: EntryCallback) => {
    entryCallbacks.push(callback);
    return () => {
      // Return cleanup function to remove the callback
      const index = entryCallbacks.indexOf(callback);
      if (index !== -1) {
        entryCallbacks.splice(index, 1);
      }
    };
  },

  // Emit event to join a specific room (e.g., for base-specific updates)
  joinBase: (baseId: string) => {
    if (!socket) return;
    socket.emit("joinBase", baseId);
  },

  // Emit event to leave a specific room
  leaveBase: (baseId: string) => {
    if (!socket) return;
    socket.emit("leaveBase", baseId);
  },

  // Check if socket is connected
  isConnected: () => {
    return socket?.connected || false;
  },
};