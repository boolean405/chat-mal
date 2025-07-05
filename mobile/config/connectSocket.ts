// utils/connectSocket.ts
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";
import { SERVER_URL } from "@/constants";

export const connectSocket = async (): Promise<Socket | null> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    console.log("Access Token:", accessToken);

    if (!accessToken) {
      console.warn("⚠️ Access token not found in Zustand store.");
      return null;
    }

    const socket: Socket = io(`${SERVER_URL}/api/socket/chat`, {
      transports: ["websocket"],
      query: {
        accessToken,
      },
    });
    console.log(socket);
    

    return socket;
  } catch (error: any) {
    console.error("Socket connection error:", error.message);
    return null;
  }
};
