import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { uploadPhoto } from "@/api/user";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import getImageMimeType from "@/utils/getImageMimeType";
import pickImage from "@/utils/pickImage";
import { useAuthStore } from "@/stores/authStore";

const screenWidth = Dimensions.get("window").width;

export default function UploadPhoto() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const { user, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoBase64, setProfilePhotoBase64] = useState<string | null>(
    null
  );
  const [coverPhotoBase64, setCoverPhotoBase64] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media access to upload photos."
        );
      }
    };
    requestPermission();
  }, []);

  if (!user) return null;

  const handleContinue = async () => {
    if (!profilePhoto && !coverPhoto) {
      return router.replace("/(tab)");
    }

    // Api call
    setIsLoading(true);
    try {
      const profileImageType = getImageMimeType(profilePhoto);
      const coverImageType = getImageMimeType(coverPhoto);

      const profilePhotoUrl =
        profilePhoto && profilePhotoBase64
          ? `data:${profileImageType};base64,${profilePhotoBase64}`
          : undefined;

      const coverPhotoUrl =
        coverPhoto && coverPhotoBase64
          ? `data:${coverImageType};base64,${coverPhotoBase64}`
          : undefined;

      const data = await uploadPhoto(profilePhotoUrl, coverPhotoUrl);
      setUser(data.result.user, data.result.accessToken);
      router.replace("/(tab)");
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message);
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverPhoto(null);
  };

  const handleRemoveProfile = () => {
    setProfilePhoto(null);
  };

  return (
    <ThemedView style={[styles.container]}>
      {/* Cover photo */}
      <TouchableOpacity
        onPress={() =>
          !isLoading &&
          pickImage(
            setCoverPhoto,
            setCoverPhotoBase64,
            setIsError,
            setErrorMessage,
            [2, 1]
          )
        }
      >
        <ThemedView style={styles.coverPhotoContainer}>
          {coverPhoto ? (
            <ThemedView>
              <Image source={{ uri: coverPhoto }} style={[styles.coverPhoto]} />
              <TouchableOpacity
                style={styles.deleteIconCover}
                onPress={handleRemoveCover}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView
              style={[
                styles.coverPlaceholder,
                { backgroundColor: color.secondary },
              ]}
            >
              <ThemedText type="small">Add Cover Photo</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        {/* )} */}
      </TouchableOpacity>

      {/* Profile Image */}
      <TouchableOpacity
        onPress={() =>
          !isLoading &&
          pickImage(
            setProfilePhoto,
            setProfilePhotoBase64,
            setIsError,
            setErrorMessage,
            [1, 1]
          )
        }
        style={[styles.profileImageWrapper, { borderColor: color.borderColor }]}
      >
        {profilePhoto ? (
          <>
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            <TouchableOpacity
              style={styles.deleteIconProfile}
              onPress={handleRemoveProfile}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </>
        ) : (
          <ThemedView
            style={[
              styles.profilePlaceholder,
              { backgroundColor: color.secondary },
            ]}
          >
            <ThemedText type="small">Add Profile Photo</ThemedText>
          </ThemedView>
        )}
      </TouchableOpacity>

      <ThemedText type="title" style={styles.nameText}>
        {user?.name}
      </ThemedText>
      <ThemedText type="subtitle">{user && `@${user.username}`}</ThemedText>
      {isError && (
        <ThemedText style={{ color: "red", marginTop: 10 }}>
          {errorMessage}
        </ThemedText>
      )}

      <ThemedButton
        style={[styles.button, isLoading && { opacity: 0.5 }]}
        disabled={isLoading}
        title={!isLoading && "Continue"}
        onPress={handleContinue}
        isLoading={isLoading}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  coverPhotoContainer: {
    width: screenWidth * 0.9,
    // height: 180,
    // borderRadius: 12,
    // marginBottom: 20,
  },

  coverPhoto: {
    // width: screenWidth * 0.9,
    height: 180,
    borderRadius: 15,
    // marginBottom: 20,
  },
  coverPlaceholder: {
    // width: screenWidth * 0.9,
    height: 180,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 20,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    marginTop: -30,
    borderRadius: 60,
    alignSelf: "center",
    borderWidth: 2,
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    marginTop: 20,
  },
  button: {
    width: "80%",
    marginTop: 50,
  },
  deleteIconCover: {
    position: "absolute",
    top: 10,
    right: 10,
    // backgroundColor: "gray",
    // borderRadius: 12,
  },

  deleteIconProfile: {
    position: "absolute",
    right: 45,
    bottom: 0,
    // backgroundColor: "gray",
    // borderRadius: 12,
    // zIndex: 2,
  },
});
