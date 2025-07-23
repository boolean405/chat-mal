import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView"; // Assuming ThemedView is available
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { ThemedText } from "./ThemedText";

type VideoPreviewProps = {
  videoUri: string;
  onSend: () => void;
  onClose: () => void;
  isLoading: boolean;
};

export default function VideoPreview({
  videoUri,
  onSend,
  onClose,
  isLoading,
}: VideoPreviewProps) {
  const [saving, setSaving] = useState(false);

  // Pause video when component unmounts or becomes invisible
 useEffect(() => {
  const timeout = setTimeout(() => {
    try {
      player?.pause?.();
    } catch (e) {
      console.warn("Failed to pause player on timeout cleanup", e);
    }
  }, 50); // give native module time to stabilize

  return () => clearTimeout(timeout);
}, []);


  // Initialize video player
  const player = useVideoPlayer(videoUri, (playerInstance) => {
    playerInstance.loop = true; // Loop the video by default
    playerInstance.play(); // Auto-play the video
  });

  // Listen for playing state changes
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Function to save the video to the device's gallery
  const saveToGallery = async () => {
    try {
      setSaving(true);
      const asset = await MediaLibrary.createAssetAsync(videoUri); // Create an asset from the URI
      // Attempt to create an album or add to an existing one
      const album = await MediaLibrary.getAlbumAsync("MyAppVideos");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("MyAppVideos", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }
      ToastAndroid.show("Saved to gallery!", ToastAndroid.SHORT);
    } catch (error: any) {
      console.error("Failed to save video:", error);
      ToastAndroid.show("Failed to save video", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  // Function to share the video using the device's sharing capabilities
  const shareVideo = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(videoUri);
      } else {
        ToastAndroid.show(
          "Sharing is not available on this device",
          ToastAndroid.SHORT
        );
      }
    } catch (error: any) {
      console.error("Failed to share video:", error);
      ToastAndroid.show("Failed to share video", ToastAndroid.SHORT);
    }
  };

  if (!videoUri || isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#00ffff" />
        <ThemedText style={{ color: "white", marginTop: 10 }}>
          Loading video...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <VideoView
        player={player}
        style={[
          styles.video,
          { width: "100%", height: "100%" }, // Make video fill the screen
        ]}
        allowsFullscreen // Allow fullscreen toggle
        allowsPictureInPicture // Allow picture-in-picture mode
        nativeControls={false} // Use custom controls
      />

      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={() => (isPlaying ? player.pause() : player.play())}
        style={styles.playPauseButton}
      >
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={80}
          color="rgba(255,255,255,0.7)"
        />
      </TouchableOpacity>

      {/* Close Button Top-Right */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Action Bar */}
      <ThemedView style={styles.bottomBar}>
        {/* Save Button */}
        <TouchableOpacity
          onPress={saveToGallery}
          disabled={saving}
          style={styles.bottomAction}
        >
          <Ionicons name="download-outline" size={26} color="#fff" />
          <ThemedText style={styles.actionText}>Save</ThemedText>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={shareVideo} style={styles.bottomAction}>
          <Ionicons name="share-social-outline" size={26} color="#fff" />
          <ThemedText style={styles.actionText}>Share</ThemedText>
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity onPress={onSend} style={styles.bottomAction}>
          <Ionicons name="send" size={26} color="rgba(35, 175, 175, 0.89)" />
          <ThemedText style={styles.actionText}>Send</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    // Dimensions set dynamically
  },
  playPauseButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  bottomBar: {
    position: "absolute",
    bottom: 30,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomAction: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});
