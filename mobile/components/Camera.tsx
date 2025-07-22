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
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

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

  useEffect(() => {
    const checkPermissions = async () => {
      if (isVisible) {
        // Reset permission denied count when modal opens
        setPermissionDeniedCount(0);

        // Request camera permissions if not granted
        if (!permission?.granted) {
          const cameraStatus = await requestPermission();
          if (!cameraStatus.granted) {
            setPermissionDeniedCount((prev) => prev + 1);
            return;
          }
        }

        // Request media library permissions if not granted
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
      // First denial - show toast and close
      ToastAndroid.show(
        "Camera permission is required to use this feature",
        ToastAndroid.SHORT
      );
      onClose();
    } else if (permissionDeniedCount >= 2) {
      // Second denial - show alert to open settings
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
        onPictureTaken(photo);

        onClose();
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

  if (!isVisible) return null;

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <View style={styles.cameraContainer}>
        {hasPermission ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            enableTorch={false}
            autofocus="on"
          >
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
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
          </CameraView>
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
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-start",
  },
  captureButton: {
    // alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
  },
  flipButton: {
    alignSelf: "flex-end",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
