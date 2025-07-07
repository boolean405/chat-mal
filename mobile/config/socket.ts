import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";

// Create a socket variable outside to maintain a singleton
let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    console.warn("⚠️ Access token not found in Zustand store.");
    return null;
  }

  // Avoid reconnecting if already connected
  if (!socket) {
    socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/socket/chat`, {
      transports: ["websocket"],
      query: {
        accessToken,
      },
    });

    // Optional: socket event listeners
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }

  return socket;
};
