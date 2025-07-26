import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  BackHandler,
  AppState,
  Dimensions,
  Pressable,
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
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { ThemedText } from "@/components/ThemedText";
import { useCallStore } from "@/stores/callStore";
import { Colors } from "@/constants/colors";
import { socket } from "@/config/socket";

export default function CallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;

  const { user } = useAuthStore();

  const [showControls, setShowControls] = useState(true);

  const {
    facing,
    isMuted,
    isVideo,
    callData,
    isRequestCall,
    isIncomingCall,
    isAcceptedCall,
    endCall,
    setIsMinimized,
    setIsMuted,
    setIsVideo,
    setFacing,
    setAcceptedCall,
  } = useCallStore();

  const otherUser = callData?.chat?.users?.find(
    (u) => u.user._id !== user?._id
  )?.user;

  const isOtherUserVideoOn = useCallStore(
    (s) => s.remoteVideoStatus[otherUser?._id ?? "unknown"]
  );

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // State
  // const [isCalling, setIsCalling] = useState(true);
  const [callTime, setCallTime] = useState(0);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  // For calling duration
  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (isAcceptedCall) {
      timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isAcceptedCall]);

  // If press back floating
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

  // End call after 30s user not accept
  useEffect(() => {
    if (isRequestCall) {
      const timer = setTimeout(() => {
        endCall();
        router.back(); // optional if you're on a separate screen
        socket.emit("end-call", { chatId });
      }, 15000); // 30 seconds

      // Cleanup the timer if component unmounts or if isRequestCall changes
      return () => clearTimeout(timer);
    }
  }, [chatId, endCall, isRequestCall, router]);

  // Socket
  useEffect(() => {
    if (!socket) return;

    const handleEndedCall = ({ chatId }: { chatId: string }) => {
      endCall();
      router.back();
    };

    socket.on("ended-call", handleEndedCall);
    return () => {
      socket.off("ended-call", handleEndedCall);
    };
  }, [endCall, router]);

  useEffect(() => {
    if (isAcceptedCall && chatId && user) {
      socket.emit("toggle-video", {
        chatId,
        userId: user._id,
        isVideo,
      });
    }
  }, [isAcceptedCall, chatId, user, isVideo]);

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

  if (!user || !callData) return null;

  // Handlers
  const toggleFacing = () =>
    facing === "front" ? setFacing("back") : setFacing("front");

  const toggleMute = () => (isMuted ? setIsMuted(false) : setIsMuted(true));

  const toggleVideo = () => {
    const newIsVideo = !isVideo;
    setIsVideo(newIsVideo);

    // Emit socket event
    socket.emit("toggle-video", {
      chatId,
      userId: user._id,
      isVideo: newIsVideo,
    });
  };

  const handlePressAcceptCall = () => {
    setAcceptedCall();
    socket.emit("accept-call", { chatId });
  };

  const otherUsers = callData.chat.users?.filter(
    (u) => u.user._id !== user._id
  );

  const handlePressEndCall = () => {
    router.back(); // optional if you're on a separate screen
    endCall();
    socket.emit("end-call", { chatId });
  };

  const chatName = callData.chat.name || getChatName(callData.chat, user._id);
  const chatPhoto = getChatPhoto(callData.chat, user._id);

  // start calling
  if (isRequestCall) {
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
              style={[styles.headerTitle]}
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
              onPress={handlePressEndCall}
              style={[styles.controlBtn, { backgroundColor: "red" }]}
            >
              <MaterialIcons name="call-end" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </>
    );
  }

  // Incoming call
  if (isIncomingCall) {
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
              {`Incoming ${callData.callMode} call`}
            </ThemedText>
          </ThemedView>

          {/* Call actions */}
          <ThemedView style={styles.incomingCallActions}>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: "green" }]}
              onPress={handlePressAcceptCall}
            >
              <Ionicons name="call-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: "red" }]}
              onPress={handlePressEndCall}
            >
              <MaterialIcons name="call-end" size={30} color="white" />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </>
    );
  }

  // Accepted call
  if (isAcceptedCall) {
    return (
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowControls((prev) => !prev)}
      >
        <StatusBar hidden />
        {/* Remote video container */}
        {otherUser && !isOtherUserVideoOn ? (
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
              {new Date(callTime * 1000).toISOString().substring(14, 19)}
            </ThemedText>
          </ThemedView>
        ) : (
          // hardcoded video
          <>
            <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
            {showControls && (
              <View style={styles.timerContainer}>
                <Text style={styles.callTimerText}>
                  {new Date(callTime * 1000).toISOString().substring(14, 19)}
                </Text>
              </View>
            )}
          </>
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
        {showControls && (
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
              onPress={handlePressEndCall}
              style={[styles.controlBtn, { backgroundColor: "red" }]}
            >
              <MaterialIcons name="call-end" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
    );
  }
}

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
  headerTitle: {
    textAlign: "center",
    paddingHorizontal: 30,
  },
  timerContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  callTimerText: {
    color: "#fff",
    fontWeight: "600",
  },
});
