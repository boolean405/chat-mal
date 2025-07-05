import React, { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { View, Text } from "react-native";

import { connectSocket } from "@/config/connectSocket";

var socket, selectedChatCompare;

export default function Notification() {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const setupSocket = async () => {
      const socket = await connectSocket();

      if (!socket) return;
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to socket:", socket.id);
        console.log("User => ", socket);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from socket");
      });

      // Example: listening for messages
      // socket.on("message", (msg) => console.log("Received:", msg));
    };

    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  return (
    <View>
      <Text>Socket IO</Text>
    </View>
  );
}
