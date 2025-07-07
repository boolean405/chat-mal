import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { connectSocket } from "@/config/socket";
import { Socket } from "socket.io-client";

var socket, selectedChat;

export default function Notification() {
  return (
    <View>
      <Text>Notification</Text>
    </View>
  );
}
