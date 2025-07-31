import { useCallStore } from "@/stores/callStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { RTCView } from "react-native-webrtc";
import { useAuthStore } from "@/stores/authStore";

const initialX = 250;
const initialY = 100;

export function FloatingCall() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    remoteStreamUrl,
    isCallActive,
    isMinimized,
    callData,
    setIsMinimized,
  } = useCallStore();

  const otherUser = callData?.chat?.users?.find(
    (u) => u.user._id !== user?._id
  )?.user;

  const isOtherUserVideoOn = useCallStore(
    (s) => s.remoteVideoStatus[otherUser?._id ?? "unknown"]
  );

  const isOtherUserFaced = useCallStore(
    (s) => s.remoteFacingStatus[otherUser?._id ?? "unknown"]
  );

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  const clamp = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  const offset = useSharedValue({ x: initialX, y: initialY });
  const start = useSharedValue({ x: initialX, y: initialY });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      const clampedX = clamp(
        e.translationX + start.value.x,
        0,
        SCREEN_WIDTH - 130
      ); // 130 is container width
      const clampedY = clamp(
        e.translationY + start.value.y,
        0,
        SCREEN_HEIGHT - 200
      ); // 200 is container height

      offset.value = {
        x: clampedX,
        y: clampedY,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    });

  // Call all hooks BEFORE early return
  if (!isCallActive || !isMinimized || !callData || !user) return null;

  const handleExpand = () => {
    setIsMinimized(false);
    router.push({
      pathname: "/(chat)/call",
      params: {
        chatId: callData.chat._id,
      },
    });
  };

  const chatPhoto = getChatPhoto(callData.chat, user._id);

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={handleExpand}>
          {remoteStreamUrl && isOtherUserVideoOn ? (
            <RTCView
              streamURL={remoteStreamUrl}
              style={styles.thumbnail}
              objectFit="cover"
              mirror={isOtherUserFaced ? true : undefined}
            />
          ) : (
            <Image source={{ uri: chatPhoto }} style={styles.thumbnail} />
          )}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 130,
    height: 175,
    borderRadius: 15,
    overflow: "hidden",
    // backgroundColor: "#000",
    zIndex: 9999,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});
