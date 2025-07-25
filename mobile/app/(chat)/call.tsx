import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  BackHandler,
  AppState,
  Alert,
  Dimensions,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  CameraType,
} from "expo-camera";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useChatStore } from "@/stores/chatStore";
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { ThemedText } from "@/components/ThemedText";
import { useCallStore } from "@/stores/callStore";
import { Colors } from "@/constants/colors";

export default function CallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const { chatId: rawChatId, callMode } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;

  const { user } = useAuthStore();
  const { getChatById, currentChat, setCurrentChat } = useChatStore();

  const {
    facing,
    isMuted,
    isVideo,
    callData,
    isMinimized,
    isCallActive,
    setCallData,
    setIsMinimized,
    setIsCallActive,
    setIsMuted,
    setIsVideo,
    setFacing,
  } = useCallStore();

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // State
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(true);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callTime, setCallTime] = useState(0);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  useEffect(() => {
    if (chatId) {
      const chat = getChatById(chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        setCurrentChat(null);
      }
    }
  }, [chatId, getChatById, setCurrentChat]);

  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (callAccepted) {
      timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callAccepted]);

  useFocusEffect(() => {
    const onBackPress = () => {
      console.log("back pressed");

      setIsMinimized(true); // 👈 minimize instead of navigating back
      return false; // 👈 prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove(); // Correct cleanup
  });

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        useCallStore.getState().setIsMinimized(true);
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Fist calling
    if (!isCallActive) {
      setCallData({ chatId, user, currentChat } as any);
      setIsVideo(callMode === "video");
      setIsCallActive(true);
      setIsMinimized(false);
    } else if (isCallActive && chatId === callData?.chatId) {
      setIsMinimized(false);
      setIsCallActive(true);
    } else if (isCallActive && chatId !== callData?.chatId) {
      router.back();
      Alert.alert("You are already calling in another chat!");
      return;
    }
  }, []);

  // Shared values for drag offset & start position
  const initialX = SCREEN_WIDTH - 130 - 20; // 20px margin from right edge
  const initialY = 50;

  const offset = useSharedValue({ x: initialX, y: initialY });
  const start = useSharedValue({ x: initialX, y: initialY });

  const clamp = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = start.value.x + e.translationX;
      const newY = start.value.y + e.translationY;

      // clamp within screen bounds minus container size
      offset.value = {
        x: clamp(newX, 0, SCREEN_WIDTH - 130), // 130 = width of localVideoContainer
        y: clamp(newY, 0, SCREEN_HEIGHT - 200), // 200 = height of localVideoContainer
      };
    })
    .onEnd(() => {
      start.value = offset.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
  }));

  // Permissions UI
  if (!cameraPermission || !micPermission) {
    return <ThemedView style={styles.container} />;
  }
  if (!cameraPermission.granted) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.text}>Camera permission needed</Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestCameraPermission}
        >
          <Text style={styles.textBtn}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  if (!micPermission.granted) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.text}>Microphone permission needed</Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestMicPermission}
        >
          <Text style={styles.textBtn}>Grant Microphone Permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!currentChat || !user) return null;

  // Handlers
  const toggleFacing = () =>
    facing === "front" ? setFacing("back") : setFacing("front");

  const toggleMute = () => (isMuted ? setIsMuted(false) : setIsMuted(true));

  const toggleVideo = () => (isVideo ? setIsVideo(false) : setIsVideo(true));

  const startCall = () => {
    setIsCalling(true);
    setIsCallActive(true);
    setIsMinimized(false);
    setCallData({ chatId, user, currentChat });
  };

  const acceptCall = () => {
    setIncomingCall(false);
    setCallAccepted(true);
    setIsCallActive(true);
    setIsMinimized(false);
    setCallData({ chatId, user, currentChat });
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallData(null);
    setIsMinimized(false);
    router.back(); // optional if you're on a separate screen
  };

  const otherUsers = currentChat.users?.filter((u) => u.user._id !== user._id);

  const otherUser = currentChat.users?.find(
    (u) => u.user._id !== user._id
  )?.user;

  const otherUserVideoEnabled = false;
  const otherUserIsMuted = false;

  const chatName = currentChat.name || getChatName(currentChat, user._id);
  const chatPhoto = getChatPhoto(currentChat, user._id);

  // start calling
  if (false) {
    // if (isCalling && !callAccepted) {
    return (
      <>
        <StatusBar hidden />
        <ThemedView style={styles.container}>
          {/* Remote video container */}
          <ThemedView style={[styles.headerContainer]}>
            {/* Profile photo container */}
            <ThemedView style={styles.profileImageContainer}>
              <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
            </ThemedView>
            {/* Chat name and call status */}
            <ThemedText
              type="headerTitle"
              style={[{ textAlign: "center" }]}
              numberOfLines={1}
            >
              {chatName}
            </ThemedText>
            <ThemedText style={[{ textAlign: "center" }]}>Calling</ThemedText>
          </ThemedView>

          {/* Local camera preview */}
          {isVideo ? (
            <GestureDetector gesture={dragGesture}>
              <Animated.View
                style={[styles.localVideoContainer, animatedStyle]}
              >
                <CameraView style={styles.localVideo} facing={facing} />
              </Animated.View>
            </GestureDetector>
          ) : null}

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={toggleMute}
              style={[styles.controlBtn, { backgroundColor: color.secondary }]}
            >
              {isMuted ? (
                <Ionicons name="mic-off-outline" size={30} color={color.icon} />
              ) : (
                <Ionicons name="mic-outline" size={30} color={color.icon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleVideo}
              style={[styles.controlBtn, { backgroundColor: color.secondary }]}
            >
              {isVideo ? (
                <Ionicons
                  name="videocam-outline"
                  size={30}
                  color={color.icon}
                />
              ) : (
                <Ionicons
                  name="videocam-off-outline"
                  size={30}
                  color={color.icon}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFacing}
              style={[styles.controlBtn, { backgroundColor: color.secondary }]}
              disabled={!isVideo}
            >
              <Ionicons
                name="camera-reverse-outline"
                size={30}
                color={color.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={endCall}
              style={[styles.controlBtn, { backgroundColor: "red" }]}
            >
              <MaterialIcons name="call-end" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </>
    );
  }

  // if (true) {
  // test only true
  if (incomingCall && !callAccepted) {
    return (
      <>
        <StatusBar hidden />
        <ThemedView style={styles.container}>
          {/* Remote video container */}
          <ThemedView style={[styles.headerContainer]}>
            {/* Profile photo container */}
            <ThemedView style={styles.profileImageContainer}>
              <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
            </ThemedView>
            {/* Chat name and call status */}
            <ThemedText
              type="headerTitle"
              style={[{ textAlign: "center" }]}
              numberOfLines={1}
            >
              {chatName}
            </ThemedText>
            {/* Calling status */}
            <ThemedText style={[{ textAlign: "center" }]}>
              Incoming Call
            </ThemedText>
          </ThemedView>

          {/* Call actions */}
          <ThemedView style={styles.incomingCallActions}>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: "green" }]}
              onPress={acceptCall}
            >
              <Ionicons name="call-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: "red" }]}
              onPress={endCall}
            >
              <MaterialIcons name="call-end" size={30} color="white" />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </>
    );
  }

  // Accepted call
  // if (callAccepted) {
  return (
    <>
      <StatusBar hidden />
      {/* Remote video container */}
      {otherUserVideoEnabled ? (
        <ThemedView style={[styles.headerContainer]}>
          {/* Profile photo container */}
          <ThemedView style={styles.profileImageContainer}>
            <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
          </ThemedView>
          {/* Chat name and call status */}
          <ThemedText
            type="headerTitle"
            style={[{ textAlign: "center" }]}
            numberOfLines={1}
          >
            {chatName}
          </ThemedText>
          <ThemedText style={{ textAlign: "center" }}>
            {new Date(callTime * 1000).toISOString().substr(14, 5)}
          </ThemedText>
        </ThemedView>
      ) : (
        // hardcoded video
        <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
      )}
      {/* Local camera preview */}
      {isVideo ? (
        <GestureDetector gesture={dragGesture}>
          <Animated.View style={[styles.localVideoContainer, animatedStyle]}>
            <CameraView style={styles.localVideo} facing={facing} />
          </Animated.View>
        </GestureDetector>
      ) : null}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={toggleMute}
          style={[styles.controlBtn, { backgroundColor: color.secondary }]}
        >
          {isMuted ? (
            <Ionicons name="mic-off-outline" size={30} color={color.icon} />
          ) : (
            <Ionicons name="mic-outline" size={30} color={color.icon} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleVideo}
          style={[styles.controlBtn, { backgroundColor: color.secondary }]}
        >
          {isVideo ? (
            <Ionicons name="videocam-outline" size={30} color={color.icon} />
          ) : (
            <Ionicons
              name="videocam-off-outline"
              size={30}
              color={color.icon}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleFacing}
          style={[styles.controlBtn, { backgroundColor: color.secondary }]}
          disabled={!isVideo}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={30}
            color={color.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={endCall}
          style={[styles.controlBtn, { backgroundColor: "red" }]}
        >
          <MaterialIcons name="call-end" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
}
// }
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  permissionBtn: {
    alignSelf: "center",
    padding: 14,
    backgroundColor: "green",
    borderRadius: 10,
  },
  textBtn: {
    color: "white",
    fontWeight: "bold",
  },
  startCallBtn: {
    marginTop: 40,
    alignSelf: "center",
    backgroundColor: "green",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startCallText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  incomingCallActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    bottom: 50,
  },
  callBtn: {
    marginHorizontal: 40,
    padding: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  remoteVideo: {
    flex: 1,
    // backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 300,
  },

  localVideoContainer: {
    position: "absolute",
    width: 130,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    // bottom: 300,
    // right: 50,
    zIndex: 999,
  },
  localVideo: {
    width: "100%",
    height: "100%",
  },
  videoOff: {
    justifyContent: "center",
    alignItems: "center",
  },

  controls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 30,
  },
  controlBtn: {
    padding: 16,
    borderRadius: 50,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
});
