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
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import ImagePreview from "./ImagePreview";

type CameraModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onPictureTaken: (photo: { uri: string; base64?: string }) => void;
};

export default function CameraModal({
  isVisible,
  onClose,
  onPictureTaken,
}: CameraModalProps) {
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionDeniedCount, setPermissionDeniedCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{
    uri: string;
    base64?: string;
  } | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (isVisible) {
        setPermissionDeniedCount(0);

        if (!permission?.granted) {
          const cameraStatus = await requestPermission();
          if (!cameraStatus.granted) {
            setPermissionDeniedCount((prev) => prev + 1);
            return;
          }
        }

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

  useEffect(() => {
    if (permissionDeniedCount === 1) {
      ToastAndroid.show(
        "Camera permission is required to use this feature",
        ToastAndroid.SHORT
      );
      onClose();
    } else if (permissionDeniedCount >= 2) {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos. Please enable it in app settings.",
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

  const takePicture = async () => {
    if (cameraRef.current && hasPermission) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });
        setPreviewPhoto(photo); // Show preview modal here
      } catch (error: any) {
        ToastAndroid.show(
          error.message || "Failed to take picture",
          ToastAndroid.SHORT
        );
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets?.length) {
      const photo = result.assets[0];
      setPreviewPhoto({
        uri: photo.uri,
        base64: photo.base64 || undefined,
      });
    }
  };

  if (!isVisible) return null;

  // Show preview modal if previewPhoto exists
  if (previewPhoto) {
    return (
      <Modal
        isVisible={isVisible}
        style={{ margin: 0 }}
        onBackdropPress={() => setPreviewPhoto(null)}
        onBackButtonPress={() => setPreviewPhoto(null)}
      >
        <ImagePreview
          photoUri={previewPhoto.uri}
          isFrontCamera={cameraType === "front"}
          onSend={() => {
            onPictureTaken(previewPhoto);
            setPreviewPhoto(null);
            onClose();
          }}
          onClose={() => setPreviewPhoto(null)}
        />
      </Modal>
    );
  }

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
              enableTorch={false}
              autofocus="on"
            />

            {/* UI Buttons Overlay */}
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={openImageLibrary}
              >
                <Ionicons name="image" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.permissionContainer}>
            <ThemedText>Camera permission is required</ThemedText>
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
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
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
});
