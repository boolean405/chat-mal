import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Button,
  Alert,
  Linking,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  CameraMode,
  useMicrophonePermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText"; // Assuming ThemedText is available
import ImagePreview from "./ImagePreview"; // Import ImagePreview
import VideoPreview from "./VideoPreview"; // Import VideoPreview
import * as FileSystem from "expo-file-system";
import { ThemedView } from "./ThemedView";
import { imageCompressor, videoCompressor } from "@/utils/mediaCompressor";
import { chatMediaPicker } from "@/utils/chatMediaPicker";

// Define the type for the captured media
type CapturedMedia = {
  uri: string;
  base64: string;
  type: "image" | "video";
  isLoading: boolean;
};

type CameraModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onMediaCaptured: (media: CapturedMedia) => void;
};

export default function CameraModal({
  isVisible,
  onClose,
  onMediaCaptured,
}: CameraModalProps) {
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [cameraMode, setCameraMode] = useState<CameraMode>("picture"); // 'picture' or 'video'
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionDeniedCount, setPermissionDeniedCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null
  );
  const [recordingTime, setRecordingTime] = useState(0); // in seconds
  const timerInterval = useRef<number | null>(null);

  const [previewMedia, setPreviewMedia] = useState<CapturedMedia | null>(null); // Stores captured photo or video
  const [isRecording, setIsRecording] = useState(false);
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  useEffect(() => {
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [microphonePermission, requestMicrophonePermission]);

  // Effect to check and request camera and media library permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (isVisible) {
        setPermissionDeniedCount(0); // Reset count on modal open

        // Request camera permission
        if (!permission?.granted) {
          const cameraStatus = await requestPermission();
          if (!cameraStatus.granted) {
            setPermissionDeniedCount((prev) => prev + 1);
            return;
          }
        }

        // Request media library permission
        if (!mediaPermission?.granted) {
          const mediaStatus = await requestMediaPermission();
          if (!mediaStatus.granted) {
            setPermissionDeniedCount((prev) => prev + 1);
            return;
          }
        }

        setHasPermission(true);
      }
    };

    checkPermissions();
  }, [
    isVisible,
    permission,
    mediaPermission,
    requestPermission,
    requestMediaPermission,
  ]);

  // Effect to handle permission denial feedback
  useEffect(() => {
    if (permissionDeniedCount === 1) {
      ToastAndroid.show(
        "Camera and Media Library permissions are required to use this feature",
        ToastAndroid.SHORT
      );
      onClose();
    } else if (permissionDeniedCount >= 2) {
      Alert.alert(
        "Permission Required",
        "Camera and Media Library access is needed to capture media. Please enable them in app settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => onClose(),
          },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
              onClose();
            },
          },
        ]
      );
    }
  }, [permissionDeniedCount, onClose]);

  // Function to capture photo or start/stop video recording
  const captureMedia = async () => {
    if (!cameraRef.current || !hasPermission) {
      return;
    }

    try {
      if (cameraMode === "picture") {
        // Capture photo
        const photo = await cameraRef.current.takePictureAsync();
        if (!photo) return;

        // Show loading preview first
        setPreviewMedia({
          uri: "",
          base64: "",
          type: "image",
          isLoading: true,
        });

        const uri = await imageCompressor(photo.uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setPreviewMedia({ uri, base64, type: "image", isLoading: false });
      } else {
        // cameraMode === "video"
        if (isRecording) {
          setIsRecording(false);

          // Stop timer
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
          setRecordingStartTime(null);
          setRecordingTime(0); // optional: reset to 0 after stop

          // Stop recording
          cameraRef.current?.stopRecording();
          return;
        } else {
          setIsRecording(true);
          setRecordingTime(0); // Reset timer

          // Start timer
          const startTime = Date.now();
          setRecordingStartTime(startTime);

          timerInterval.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setRecordingTime(elapsed);
          }, 1000);

          const video = await cameraRef.current?.recordAsync({
            maxDuration: 60,
          });
          if (!video) return;

          setPreviewMedia({
            uri: "",
            base64: "",
            type: "video",
            isLoading: true,
          });

          const uri = await videoCompressor(video.uri);
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setPreviewMedia({ uri, base64, type: "video", isLoading: false });
          setIsRecording(false);
        }
      }
    } catch (error: any) {
      ToastAndroid.show(
        error.message ||
          `Failed to ${
            cameraMode === "picture" ? "take picture" : "record video"
          }`,
        ToastAndroid.SHORT
      );
      setIsRecording(false);
    }
  };

  // Function to toggle between front and back camera
  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  // Function to toggle between picture and video mode
  const toggleCameraMode = () => {
    setCameraMode((prevMode) => (prevMode === "picture" ? "video" : "picture"));
    setIsRecording(false); // Reset recording state when changing mode
  };

  // Open image/video library
  const openMediaLibrary = async () => {
    try {
      // Show an immediate loading preview with just the type
      setPreviewMedia({
        uri: "",
        base64: "",
        type: "video", // Default, will be updated
        isLoading: true,
      });

      // Pick and compress the media
      const media = await chatMediaPicker();
      if (!media) {
        setPreviewMedia(null);
        return;
      }

      // Show final preview
      setPreviewMedia({
        uri: media.uri,
        base64: media.base64,
        type: media.type === "video" ? "video" : "image",
        isLoading: false,
      });
    } catch (error) {
      console.error("Media pick failed", error);
      ToastAndroid.show("Failed to pick media", ToastAndroid.SHORT);
      setPreviewMedia(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (cameraType === "front" && cameraMode === "video") {
    ToastAndroid.show(
      "Front camera video recording is not supported on this device.",
      ToastAndroid.LONG
    );
    // return;
  }

  if (!isVisible) return null;

  // Show preview modal if previewMedia exists
  if (previewMedia) {
    return (
      <Modal
        isVisible={isVisible}
        style={{ margin: 0 }}
        onBackdropPress={() => setPreviewMedia(null)}
        onBackButtonPress={() => setPreviewMedia(null)}
      >
        {previewMedia.type === "image" ? (
          <ImagePreview
            photoUri={previewMedia.uri}
            isFrontCamera={cameraType === "front"} // Pass camera type for image flipping
            isLoading={previewMedia.isLoading}
            onClose={() => setPreviewMedia(null)}
            onSend={() => {
              onMediaCaptured(previewMedia);
              setPreviewMedia(null);
              onClose();
            }}
          />
        ) : (
          <VideoPreview
            videoUri={previewMedia.uri}
            onClose={() => setPreviewMedia(null)}
            isLoading={previewMedia.isLoading}
            onSend={() => {
              onMediaCaptured(previewMedia);
              setPreviewMedia(null);
              onClose();
            }}
          />
        )}
      </Modal>
    );
  }

  // Main camera view
  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <View style={styles.cameraContainer}>
        {hasPermission ? (
          <View
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "black",
              position: "relative",
            }}
          >
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={cameraType}
              mode={cameraMode} // Set camera mode (picture/video)
              enableTorch={false}
              autofocus="on"
            />

            {/* UI Buttons Overlay */}
            <View style={styles.cameraButtonContainer}>
              {/* Gallery Button */}
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={openMediaLibrary}
              >
                <Ionicons name="image" size={24} color="white" />
              </TouchableOpacity>

              {/* Capture/Record Button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={captureMedia}
                disabled={isRecording && cameraMode === "picture"} // Disable capture button if recording video
              >
                <View
                  style={[
                    styles.captureButtonInner,
                    cameraMode === "video" &&
                      isRecording &&
                      styles.recordingIndicator, // Red square for video recording
                    cameraMode === "video" &&
                      !isRecording &&
                      styles.videoModeButton, // Red circle for video mode
                  ]}
                />
              </TouchableOpacity>

              {/* Toggle Camera Type Button (Front/Back) */}
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Mode Toggle Button (Picture/Video) */}
            <TouchableOpacity
              style={styles.modeToggleButton}
              onPress={toggleCameraMode}
            >
              <Ionicons
                name={cameraMode === "picture" ? "camera" : "videocam"}
                size={24}
                color="white"
              />
              <ThemedText style={styles.modeToggleText}>
                {cameraMode === "picture" ? "Photo" : "Video"}
              </ThemedText>
            </TouchableOpacity>

            {isRecording && cameraMode === "video" && (
              <View style={styles.recordingTimerContainer}>
                <Ionicons
                  name="ellipse"
                  size={12}
                  color="red"
                  style={{ marginRight: 6 }}
                />
                <ThemedText style={styles.recordingTimerText}>
                  {formatTime(recordingTime)}
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <ThemedView style={styles.permissionContainer}>
            <ThemedText>
              Camera and Media Library permissions are required
            </ThemedText>
            <Button
              title="Grant Permission"
              onPress={async () => {
                const cameraStatus = await requestPermission();
                const mediaStatus = await requestMediaPermission();

                if (cameraStatus.granted && mediaStatus.granted) {
                  setHasPermission(true);
                } else {
                  setPermissionDeniedCount((prev) => prev + 1);
                }
              }}
            />
          </ThemedView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    position: "relative",
  },
  modal: {
    margin: 0,
    flex: 1,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)", // translucent background behind buttons
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
  captureButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
  },
  videoModeButton: {
    backgroundColor: "red", // Red circle for video mode
  },
  recordingIndicator: {
    width: 30,
    height: 30,
    borderRadius: 5, // Square shape for recording indicator
    backgroundColor: "red",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggleButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modeToggleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  recordingTimerContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingTimerText: {
    color: "white",
    fontWeight: "bold",
  },
});
