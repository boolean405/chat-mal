import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Button,
  Alert,
  Linking,
  ActivityIndicator, // For loading indicator during recording
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

// Define the type for the captured media
type CapturedMedia = {
  uri: string;
  base64?: string;
  type: "image" | "video"; // Add type property
};

type CameraModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onMediaCaptured: (media: CapturedMedia) => void; // Renamed for clarity
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
  const [previewMedia, setPreviewMedia] = useState<CapturedMedia | null>(null); // Stores captured photo or video
  const [isRecording, setIsRecording] = useState(false); // State for video recording status

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
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Increased quality slightly
          base64: true,
        });
        if (photo) {
          const base64 = photo.base64
            ? photo.base64
            : await FileSystem.readAsStringAsync(photo.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });

          setPreviewMedia({
            uri: photo.uri,
            base64,
            type: "image",
          });
        }
      } else {
        console.log("here cameraMode", cameraMode);

        // cameraMode === "video"
        if (isRecording) {
          console.log("here isRecording", isRecording);

          // Stop recording
          cameraRef.current?.stopRecording();
          setIsRecording(false);
          return;
        } else {
          console.log("here !isRecording");

          // Start recording
          setIsRecording(true);
          const video = await cameraRef.current?.recordAsync();
          console.log("here video", video?.uri);

          if (video) {
            console.log("Video captured:", video);

            const base64 = await FileSystem.readAsStringAsync(video.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            setPreviewMedia({ uri: video.uri, base64, type: "video" });
          }
          setIsRecording(false); // Recording stops after video is captured or maxDuration reached
        }
      }
    } catch (error: any) {
      console.log("here error", error.message);

      ToastAndroid.show(
        error.message ||
          `Failed to ${
            cameraMode === "picture" ? "take picture" : "record video"
          }`,
        ToastAndroid.SHORT
      );
      setIsRecording(false); // Ensure recording state is reset on error
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

  // Function to open image/video library
  const openMediaLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"], // Allow both images and videos
      quality: 0.5,
      base64: true, // Request base64 for images, not applicable for videos directly
    });

    if (!result.canceled && result.assets?.length) {
      const media = result.assets[0];

      const base64 = media.base64
        ? media.base64
        : await FileSystem.readAsStringAsync(media.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

      setPreviewMedia({
        uri: media.uri,
        base64,
        type: media.type === "image" ? "image" : "video", // Determine media type
      });
    }
  };

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
            onSend={() => {
              onMediaCaptured(previewMedia);
              setPreviewMedia(null);
              onClose();
            }}
            onClose={() => setPreviewMedia(null)}
          />
        ) : (
          <VideoPreview
            videoUri={previewMedia.uri}
            onSend={() => {
              onMediaCaptured(previewMedia);
              setPreviewMedia(null);
              onClose();
            }}
            onClose={() => setPreviewMedia(null)}
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
              // For video recording, ensure audio is enabled if needed
              // videoQuality="720p" // Example: set default video quality
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
                {isRecording && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={styles.recordingLoader}
                  />
                )}
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
          </View>
        ) : (
          <View style={styles.permissionContainer}>
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
          </View>
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
    backgroundColor: "rgba(0,0,0,0.6)",
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
    elevation: 5,
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
  recordingLoader: {
    position: "absolute",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
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
});
