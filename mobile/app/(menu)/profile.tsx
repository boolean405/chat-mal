import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import PostCard from "@/components/PostCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { fetchUser } from "@/config/user";
import { Colors } from "@/constants/colors";
import { User } from "@/types";

const { width: screenWidth } = Dimensions.get("window");
const COVER_HEIGHT = 180;

export default function FlashScreen() {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const userData = await fetchUser();
    setUser(userData);
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const userData = await fetchUser();
    setUser(userData);
    setRefreshing(false);
  }, []);

  const handleEditProfile = () => {
    router.push("/(setting)/edit-profile");
  };

  const handleLove = (_id: string) => {
    if (!user) return;
    setUser((prev) => ({
      ...prev!,
      posts: prev!.posts.map((post) =>
        post._id === _id
          ? {
              ...post,
              loved: !post.loved,
              loveCount: (post.loveCount || 0) + (post.loved ? -1 : 1),
            }
          : post
      ),
    }));
  };

  const handleComment = (_id: string) => {
    Alert.alert("Comment", `Open comments for post: ${_id}`);
  };

  const handleShare = (_id: string) => {
    if (!user) return;
    Alert.alert("Share", `Share post: ${_id}`);
    setUser((prev) => ({
      ...prev!,
      posts: prev!.posts.map((post) =>
        post._id === _id
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      ),
    }));
  };

  const handleUserPress = (user: Omit<User, "posts">) => {
    console.log("User pressed:", user.name);
  };

  const handleFollowersPress = () => {
    Alert.alert("Followers", `${user?.followers} people follow ${user?.name}`);
  };

  const handleFollowingPress = () => {
    Alert.alert(
      "Following",
      `${user?.name} is following ${user?.following} people`
    );
  };

  const renderHeader = () => (
    <>
      <TouchableOpacity
        onPress={() => setCoverModalVisible(true)}
        style={styles.coverPhotoContainer}
      >
        <Image source={{ uri: user!.coverPhoto }} style={styles.coverPhoto} />
      </TouchableOpacity>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
          <Image
            source={{ uri: user!.profilePhoto }}
            style={[
              styles.profilePhoto,
              {
                borderColor: theme.borderColor,
                backgroundColor: theme.secondary,
              },
            ]}
          />
        </TouchableOpacity>
        <ThemedText type="title">{user?.name}</ThemedText>
        <ThemedText type="subtitle">@{user?.username}</ThemedText>
        <ThemedText style={[styles.bio]}>{user?.bio && user.bio}</ThemedText>
        <View style={styles.stats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={handleFollowersPress}
          >
            <ThemedText type="subtitle">{user!.followers}</ThemedText>
            <ThemedText type="param">Followers</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={handleFollowingPress}
          >
            <ThemedText type="subtitle">{user!.following}</ThemedText>
            <ThemedText type="param">Following</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedButton
          title={!isLoading && "Edit profile"}
          isLoading={isLoading}
          onPress={handleEditProfile}
          style={styles.editButton}
        />
      </View>

      <ThemedText type="subtitle" style={[styles.sectionTitle]}>
        Posts
      </ThemedText>
    </>
  );

  if (isLoading || !user) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={user.posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            colorScheme={colorScheme}
            onLove={handleLove}
            onComment={handleComment}
            onShare={handleShare}
            onUserPress={handleUserPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
            colors={[theme.background]}
            progressBackgroundColor={theme.tint}
          />
        }
        style={[styles.container, { backgroundColor: theme.background }]}
      />

      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAvatarModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: user.profilePhoto }}
              style={styles.fullAvatar}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={coverModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCoverModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCoverModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: user.coverPhoto }}
              style={styles.fullCover}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverPhotoContainer: {
    width: "100%",
    height: COVER_HEIGHT,
    borderRadius: 30,
    marginTop: 30,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  coverPhoto: {
    width: screenWidth,
    height: COVER_HEIGHT,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    alignItems: "center",
    marginTop: -50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    marginBottom: 20,
  },
  bio: { marginTop: 10, marginBottom: 20, textAlign: "center" },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 16,
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { margin: 20 },
  postsList: { paddingHorizontal: 16, paddingBottom: 32 },
  modalOverlay: {
    flex: 1,
    // backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullAvatar: {
    width: "100%",
    height: "60%",
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  fullCover: {
    width: "100%",
    height: "50%",
    borderRadius: 30,
    backgroundColor: "#eee",
  },
});
