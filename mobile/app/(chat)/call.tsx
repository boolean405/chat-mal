import React, { useEffect, useRef, useState } from "react";
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
import { webrtcClient } from "@/config/webrtcClient";
import { RTCView } from "react-native-webrtc";

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

  const isOtherUserMuted = useCallStore(
    (s) => s.remoteAudioStatus[otherUser?._id ?? "unknown"]
  );

  const isOtherUserFaced = useCallStore(
    (s) => s.remoteFacingStatus[otherUser?._id ?? "unknown"]
  );

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // State
  // const [isCalling, setIsCalling] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (isRequestCall) {
      webrtcClient.init({
        chatId,
        isVideo,
        isAudio: !isMuted,
        facingMode: facing === "front" ? "user" : "environment",
        onLocalStream: (s) => setLocalStreamUrl(s ? s.toURL() : null),
        onRemoteStream: (s) => setRemoteStreamUrl(s ? s.toURL() : null),
      });
    }
  }, [chatId, facing, isMuted, isRequestCall, isVideo]);

  useEffect(() => {
    if (isRequestCall) {
      socket.emit("request-call", {
        chatId,
        callMode: callData?.callMode,
      });
    }
  }, [callData?.callMode, chatId, isRequestCall]);

  // Socket
  useEffect(() => {
    if (!socket) return;

    const handleEndedCall = ({ chatId: endedChatId }: { chatId: string }) => {
      if (endedChatId !== callData?.chat._id) return;
      webrtcClient.destroy();
      endCall();
      router.back();
    };

    socket.on("ended-call", handleEndedCall);
    return () => {
      socket.off("ended-call", handleEndedCall);
    };
  }, [callData?.chat._id, endCall, router]);

  useEffect(() => {
    if (isAcceptedCall && chatId && user) {
      socket.emit("toggle-face", {
        chatId,
        userId: user._id,
        isFaced: facing === "front" ? true : false,
      });
      socket.emit("toggle-video", {
        chatId,
        userId: user._id,
        isVideo,
      });
      socket.emit("toggle-mute", {
        chatId,
        userId: user._id,
        isMuted,
      });
    }
  }, [chatId, facing, isAcceptedCall, isMuted, isVideo, user]);

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
  const toggleFacing = async () => {
    const newFacing = facing === "front" ? "back" : "front";
    setFacing(newFacing);
    if (isAcceptedCall) {
      await webrtcClient.switchCamera();
      // Emit socket event
      // socket.emit("toggle-face", {
      //   chatId,
      //   userId: user._id,
      //   isFaced: newFacing === "front" ? true : false,
      // });
    }
  };

  const toggleMute = async () => {
    const newIsMuted = !isMuted;
    setIsMuted(newIsMuted);
    if (isAcceptedCall) {
      await webrtcClient.toggleAudio(newIsMuted);
      // Emit socket event
      // socket.emit("toggle-mute", {
      //   chatId,
      //   userId: user._id,
      //   isMuted: newIsMuted,
      // });
    }
  };

  const toggleVideo = async () => {
    const newIsVideo = !isVideo;
    setIsVideo(newIsVideo);
    if (isAcceptedCall) {
      await webrtcClient.toggleVideo(newIsVideo);

      // Emit socket event
      socket.emit("toggle-video", {
        chatId,
        userId: user._id,
        isVideo: newIsVideo,
      });

      // Emit socket event
      // socket.emit("toggle-face", {
      //   chatId,
      //   userId: user._id,
      //   isFaced: facing === "front" ? true : false,
      // });
    }
  };

  const handlePressAcceptCall = () => {
    webrtcClient.init({
      chatId,
      isVideo,
      isAudio: !isMuted,
      facingMode: facing === "front" ? "user" : "environment",
      onLocalStream: (s) => setLocalStreamUrl(s ? s.toURL() : null),
      onRemoteStream: (s) => setRemoteStreamUrl(s ? s.toURL() : null),
    });
    webrtcClient.startAsCallee();
    setAcceptedCall();

    socket.emit("accept-call", { chatId });
  };

  const handlePressEndCall = () => {
    webrtcClient.destroy();
    socket.emit("end-call", { chatId });
    endCall();
    router.back();
  };

  const chatName = callData.chat.name || getChatName(callData.chat, user._id);
  const chatPhoto = getChatPhoto(callData.chat, user._id);

  // start calling
  if (isRequestCall) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />

        {/* ✅ Local camera preview as full background if video is on */}
        {isVideo && (
          <CameraView style={StyleSheet.absoluteFill} facing={facing} />
        )}

        {/* ✅ UI over the video */}
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.headerContainer}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
            </View>

            <ThemedText
              type="headerTitle"
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {chatName}
            </ThemedText>

            <ThemedText style={{ textAlign: "center" }}>Calling</ThemedText>
          </View>

          {/* ✅ Controls */}
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
        </View>
      </View>
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
              style={styles.headerTitle}
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
            <ThemedView
              style={{
                alignItems: "center",
                flexDirection: "row",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText style={{ textAlign: "center" }}>
                {new Date(callTime * 1000).toISOString().substring(14, 19)}
              </ThemedText>

              {isOtherUserMuted && (
                <Ionicons
                  name="mic-off-outline"
                  size={16}
                  color={"red"}
                  style={{ position: "absolute", right: -20 }}
                />
              )}
            </ThemedView>
          </ThemedView>
        ) : (
          <>
            {remoteStreamUrl && (
              <RTCView
                streamURL={remoteStreamUrl}
                style={StyleSheet.absoluteFill}
                objectFit="cover"
                mirror={isOtherUserFaced ? true : undefined}
              />
            )}
            {showControls && (
              <View style={styles.topStatusContainer}>
                <Text style={styles.callTimerText}>
                  {new Date(callTime * 1000).toISOString().substring(14, 19)}
                </Text>
                {isOtherUserMuted && (
                  <Ionicons name="mic-off-outline" size={16} color={"red"} />
                )}
              </View>
            )}
          </>
        )}
        {/* Local stream preview */}
        {isVideo && localStreamUrl ? (
          <GestureDetector gesture={dragGesture}>
            <Animated.View style={[styles.localVideoContainer, animatedStyle]}>
              <RTCView
                streamURL={localStreamUrl}
                style={styles.localVideo}
                objectFit="cover"
                mirror={facing === "front"}
              />
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
    padding: 15,
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
  topStatusContainer: {
    position: "absolute",
    alignItems: "center",
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
