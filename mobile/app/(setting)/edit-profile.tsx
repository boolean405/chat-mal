import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import pickImage from "@/utils/pickImage";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { editProfile, deletePhoto, uploadPhoto } from "@/api/user";
import { ThemedButton } from "@/components/ThemedButton";
import getImageMimeType from "@/utils/getImageMimeType";
import { useAuthStore } from "@/stores/authStore";
import ScreenHeader from "@/components/ScreenHeader";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useHeaderHeight } from "@react-navigation/elements";

const screenWidth = Dimensions.get("window").width;
const NAME_RE = /^(?=.{1,20}$)[\p{L}\p{M} ]+$/u;

export default function EditProfile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const headerHeight = useHeaderHeight() + (StatusBar.currentHeight ?? 0);

  const color = Colors[colorScheme ?? "light"];
  const { user, setUserOnly } = useAuthStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [profilePhotoBase64, setProfilePhotoBase64] = useState<string | null>(
    null
  );
  const [coverPhotoBase64, setCoverPhotoBase64] = useState<string | null>(null);

  const [birthday, setBirthday] = useState<Date | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    null
  );
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  const [isInvalidBirthday, setIsInvalidBirthday] = useState(false);
  const [isInvalidGender, setIsInvalidGender] = useState(false);

  const [isInvalidName, setIsInvalidName] = useState(false);
  const [isInvalidUsername, setIsInvalidUsername] = useState(false);
  const [isExistUsername, setIsExistUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canChange, setCanChange] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          setName(user.name || "");
          setUsername(user.username || "");
          setProfilePhoto(user.profilePhoto || null);
          setCoverPhoto(user.coverPhoto || null);
          setBirthday(user.birthday ? new Date(user.birthday) : null);
          setGender(user.gender ?? null);
        }
      } catch (error) {
        console.log("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, [user]);

  // Validate
  useEffect(() => {
    const validateInputs = () => {
      // Normalize for comparison (avoid time-of-day / TZ noise)
      const norm = (d?: Date | null) =>
        d
          ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
          : null;

      const userBirthday = user?.birthday ? new Date(user.birthday) : null;

      const changed =
        (user?.name ?? "") !== name ||
        (user?.username ?? "") !== username ||
        norm(userBirthday) !== norm(birthday) ||
        (user?.gender ?? null) !== (gender ?? null);

      setCanChange(changed);

      // name + username (unchanged)
      setIsInvalidName(!NAME_RE.test(name.trim()));
      setIsInvalidUsername(!/^[a-z0-9]{5,20}$/.test(username));

      // birthday: optional; if provided, must be sensible
      if (birthday) {
        const min = new Date("1900-01-01T00:00:00Z");
        const today = new Date();
        // Compare date-only (local)
        const bd = new Date(
          birthday.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        );
        const invalid = !(bd > min && bd <= today);
        setIsInvalidBirthday(invalid);
      } else {
        setIsInvalidBirthday(false);
      }

      // gender: OPTIONAL by default (no error if null).
      // If you want to REQUIRE selecting a gender, uncomment the next line:
      // setIsInvalidGender(gender == null);

      // If optional, keep it always false:
      setIsInvalidGender(false);
    };

    validateInputs();
  }, [
    name,
    gender,
    username,
    birthday,
    user?.name,
    user?.gender,
    user?.birthday,
    user?.username,
  ]);

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

  const handleUpdateProfile = async () => {
    Keyboard.dismiss();

    // Api call
    setIsLoading(true);
    try {
      const data = await editProfile({ name, username, birthday, gender });
      setUserOnly(data.result.user);

      Alert.alert("Success", data.message);
    } catch (error: any) {
      setIsError(true);
      error.status === 409 && setIsExistUsername(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCover = () => {
    Alert.alert(
      "Delete Cover Photo",
      "Are you sure you want to delete cover photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // api here
              setIsCoverLoading(true);
              const data = await deletePhoto(coverPhoto, "coverPhoto");

              if (data.status) {
                setCoverPhoto(null);
                setUserOnly(data.result.user);
                ToastAndroid.show("Cover photo deleted", ToastAndroid.SHORT);
              } else {
                ToastAndroid.show(
                  data.message || "Failed to delete cover photo",
                  ToastAndroid.SHORT
                );
              }
            } catch (error: any) {
              setIsError(true);
              setErrorMessage(error.message);
              ToastAndroid.show(
                error?.message || "Something went wrong",
                ToastAndroid.SHORT
              );
            } finally {
              setIsCoverLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveProfile = () => {
    Alert.alert(
      "Delete Profile Photo",
      "Are you sure you want to delete profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // api here
            setIsProfileLoading(true);
            try {
              const data = await deletePhoto(profilePhoto, "profilePhoto");

              if (data.status) {
                setProfilePhoto(null);
                setUserOnly(data.result.user);
                ToastAndroid.show("Profile photo deleted", ToastAndroid.SHORT);
              } else {
                ToastAndroid.show(
                  data.message || "Failed to delete profile photo",
                  ToastAndroid.SHORT
                );
              }
            } catch (error: any) {
              console.log("Delete profile photo error:", error);
              ToastAndroid.show(
                error?.message || "Something went wrong",
                ToastAndroid.SHORT
              );
            } finally {
              setIsProfileLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCoverUpload = async (uri: string, base64: string) => {
    Keyboard.dismiss();

    // Api call
    setIsCoverLoading(true);
    try {
      const coverImageType = getImageMimeType(uri);

      const coverPhotoUrl =
        uri && base64 ? `data:${coverImageType};base64,${base64}` : undefined;

      const data = await uploadPhoto(null, coverPhotoUrl);
      setUserOnly(data.result.user);
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message);
      Alert.alert("Cover photo upload Error", error.message);
    } finally {
      setIsCoverLoading(false);
    }
  };

  const handleProfileUpload = async (uri: string, base64: string) => {
    Keyboard.dismiss();

    // Api call
    setIsProfileLoading(true);
    try {
      const profileImageType = getImageMimeType(uri);

      const profilePhotoUrl =
        uri && base64 ? `data:${profileImageType};base64,${base64}` : undefined;

      const data = await uploadPhoto(profilePhotoUrl, null);
      setUserOnly(data.result.user);
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message);
      Alert.alert("Upload Error", error.message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={headerHeight}
    >
      {/* Header */}
      <ScreenHeader title="Edit Profile" />
      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.container]}>
          {/* Cover Image */}
          <TouchableOpacity
            onPress={() =>
              !isLoading &&
              pickImage(
                setCoverPhoto,
                setCoverPhotoBase64,
                setIsError,
                setErrorMessage,
                [2, 1],
                handleCoverUpload
              )
            }
          >
            <ThemedView style={styles.coverPhotoContainer}>
              {isCoverLoading && (
                <ActivityIndicator
                  size="small"
                  color={color.primaryBackground}
                  style={[styles.coverUploadingIcon]}
                />
              )}
              {coverPhoto ? (
                <ThemedView>
                  <Image
                    source={{ uri: coverPhoto }}
                    style={[styles.coverPhoto]}
                  />
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
                    { backgroundColor: color.secondaryBackground },
                  ]}
                >
                  <ThemedText type="small">Add Cover Photo</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
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
                [1, 1],
                handleProfileUpload
              )
            }
            style={[
              styles.profileImageWrapper,
              { borderColor: color.primaryBackground },
            ]}
          >
            {isProfileLoading && (
              <ActivityIndicator
                size="small"
                color={color.primaryBackground}
                style={[styles.profileUploadingIcon]}
              />
            )}
            {profilePhoto ? (
              <>
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profilePhoto}
                />
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={color.secondaryIcon}
                  style={styles.addPhotoText}
                />
                {/* <TouchableOpacity
                  style={styles.deleteIconProfile}
                  onPress={handleRemoveProfile}
                >
                <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity> */}
              </>
            ) : (
              <ThemedView
                style={[
                  styles.profilePlaceholder,
                  { backgroundColor: color.secondaryText },
                ]}
              >
                <ThemedText type="small">Add Profile Photo</ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          {/* Inputs and Button */}
          <ThemedView style={styles.bottomContainer}>
            <ThemedText numberOfLines={1} type="largest">
              {name}
            </ThemedText>
            <ThemedText type="large">{username && `@${username}`}</ThemedText>

            {/* <ThemedText type="large" style={styles.nameText}>
              Edit your profile
            </ThemedText> */}

            {/* Name Input */}
            <ThemedView
              style={[
                styles.inputContainer,
                { borderColor: color.secondaryBorder },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                style={{ color: color.primaryIcon }}
              />
              <TextInput
                style={[styles.textInput, { color: color.primaryText }]}
                placeholder="Name"
                autoComplete="name"
                placeholderTextColor="gray"
                value={name}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                onBlur={() => setName(name.trim())}
                onChangeText={(text) => {
                  setIsError(false);
                  const sanitized = text.replace(/^\s+/, ""); // Remove leading spaces
                  // .replace(/[^\p{L}\p{M}\s]/gu, "");

                  setName(sanitized);
                }}
              />
            </ThemedView>

            {/* Username Input */}
            <ThemedView
              style={[
                styles.inputContainer,
                {
                  borderColor: isExistUsername ? "red" : color.primaryBorder,
                },
              ]}
            >
              <Ionicons
                name="at-outline"
                size={24}
                style={{ color: color.primaryIcon }}
              />
              <TextInput
                style={[styles.textInput, { color: color.primaryText }]}
                placeholder="Username"
                autoComplete="username-new"
                placeholderTextColor="gray"
                value={username}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={() =>
                  !isInvalidName &&
                  !isInvalidUsername &&
                  !isError &&
                  handleUpdateProfile()
                }
                onChangeText={(text) => {
                  setIsError(false);
                  setIsExistUsername(false);
                  const sanitized = text
                    .replace(/[^a-z0-9]/g, "")
                    .toLowerCase();
                  setUsername(sanitized);
                }}
              />
            </ThemedView>

            {/* Birthday Input */}
            <ThemedView
              style={[
                styles.inputContainer,
                {
                  borderColor: isInvalidBirthday
                    ? "red"
                    : color.secondaryBorder,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                style={{ color: color.primaryIcon }}
              />
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                  height: 50,
                  justifyContent: "center",
                }}
                onPress={() => setShowBirthdayPicker(true)}
                activeOpacity={0.7}
              >
                <ThemedText style={{ color: color.primaryText }}>
                  {birthday
                    ? format(birthday, "dd-MM-yyyy")
                    : "Birthday (optional)"}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setBirthday(null)}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  style={{ color: color.secondaryIcon }}
                />
              </TouchableOpacity>
            </ThemedView>

            {showBirthdayPicker && (
              <DateTimePicker
                value={birthday ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                minimumDate={new Date("1900-01-01")}
                onChange={(e: DateTimePickerEvent, d?: Date) => {
                  if (Platform.OS === "android") setShowBirthdayPicker(false);
                  if (d) setBirthday(d);
                }}
                style={{ alignSelf: "stretch" }}
              />
            )}

            {/* Gender Toggle */}
            <ThemedView style={styles.genderRow}>
              <Ionicons
                name={
                  gender === "male"
                    ? "male-outline"
                    : gender === "female"
                    ? "female-outline"
                    : "male-female-outline"
                }
                size={24}
                style={{ color: color.primaryIcon, marginRight: 8 }}
              />
              <TouchableOpacity
                onPress={() => setGender((g) => (g === "male" ? g : "male"))}
                disabled={isLoading}
                style={[
                  styles.genderChip,
                  {
                    borderColor: color.secondaryBorder,
                    backgroundColor:
                      gender === "male"
                        ? color.primaryButtonBackground
                        : "transparent",
                  },
                ]}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={{ color: gender === "male" ? "black" : "white" }}
                >
                  Male
                </ThemedText>
              </TouchableOpacity>

              {/* Female */}
              <TouchableOpacity
                onPress={() =>
                  setGender((g) => (g === "female" ? g : "female"))
                }
                disabled={isLoading}
                style={[
                  styles.genderChip,
                  {
                    borderColor: color.secondaryBorder,
                    backgroundColor:
                      gender === "female"
                        ? color.primaryButtonBackground
                        : "transparent",
                  },
                ]}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={{ color: gender === "female" ? "black" : "white" }}
                >
                  Female
                </ThemedText>
              </TouchableOpacity>

              {/* Other */}
              <TouchableOpacity
                onPress={() => setGender((g) => (g === "other" ? g : "other"))}
                disabled={isLoading}
                style={[
                  styles.genderChip,
                  {
                    borderColor: color.secondaryBorder,
                    backgroundColor:
                      gender === "other"
                        ? color.primaryButtonBackground
                        : "transparent",
                  },
                ]}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={{ color: gender === "other" ? "black" : "white" }}
                >
                  Other
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {isError && (
              <ThemedText style={{ color: "red", marginVertical: 15 }}>
                {errorMessage}
              </ThemedText>
            )}

            <ThemedButton
              style={[
                styles.button,
                (isInvalidUsername ||
                  isInvalidName ||
                  isInvalidBirthday ||
                  isInvalidGender ||
                  isLoading ||
                  isError ||
                  isExistUsername ||
                  !canChange) && { opacity: 0.5 },
              ]}
              title={"Update Profile"}
              onPress={handleUpdateProfile}
              disabled={
                isInvalidUsername ||
                isInvalidName ||
                isInvalidBirthday ||
                isInvalidGender ||
                isLoading ||
                isError ||
                isExistUsername ||
                !canChange
              }
              isLoading={isLoading}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  addPhotoText: {
    position: "absolute",
    bottom: 0,
    right: 42,
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    // borderWidth: 0.5,
    borderBottomWidth: 1,
    width: "80%",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
    paddingTop: 0,
    paddingBottom: 0,
  },
  button: {
    width: "80%",
    marginTop: 20,
  },
  coverPhotoContainer: {
    width: screenWidth * 0.9,
    height: 180,
    overflow: "hidden",
    paddingTop: 10,
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
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
  },
  profileImageWrapper: {
    // position: "relative",
    width: 120,
    height: 120,
    marginTop: -30,
    borderRadius: 60,
    alignSelf: "center",
    borderWidth: 3,
    overflow: "hidden",
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
  profileUploadingIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 2,
  },
  coverUploadingIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 2,
  },
  genderRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
    gap: 10,
  },
  genderChip: {
    borderWidth: 0.4,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
