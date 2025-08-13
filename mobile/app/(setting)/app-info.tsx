import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";
import * as StoreReview from "expo-store-review";
import * as Sharing from "expo-sharing";

import { Colors } from "@/constants/colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";

import InfoRow from "@/components/InfoRow";
import SectionCard from "@/components/SectionCard";
import openLink from "@/utils/openLink";
import {
  APP_STORE_WEB,
  PLAY_STORE_WEB,
  RATE_APP_URL,
  TERMS_URL,
  PRIVACY_URL,
  WEBSITE_URL,
  LICENSES_URL,
} from "@/utils/storeUrls";

export default function AppInfo() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const [clearing, setClearing] = useState(false);

  const appMeta = useMemo(() => {
    const name = Application.applicationName ?? "Chat Mal";
    const version =
      Application.nativeApplicationVersion ??
      Application.nativeApplicationVersion ??
      "1.0.0";
    const build = Application.nativeBuildVersion ?? "1";
    const appId =
      Platform.OS === "android"
        ? Application.getAndroidId
        : Application.applicationId;
    const bundleId =
      Platform.OS === "ios"
        ? Application.applicationId
        : Application.applicationId;
    const deviceModel = Device.modelName ?? "Unknown device";
    const os = `${Platform.OS} ${Device.osVersion ?? ""}`.trim();

    return { name, version, build, appId, bundleId, deviceModel, os };
  }, []);

  async function handleRate() {
    try {
      const supported = await StoreReview.isAvailableAsync();
      if (supported) {
        await StoreReview.requestReview();
        // No return value — so either trust it ran, or always also open store link
      } else {
        await openLink(RATE_APP_URL);
      }
    } catch {
      await openLink(RATE_APP_URL);
    }
  }

  async function handleShareApp() {
    const url = Platform.OS === "ios" ? APP_STORE_WEB : PLAY_STORE_WEB;
    await Share.share({
      title: "Chat Mal",
      message: `Try Chat Mal — private chat, calls & stories.\n${url}`,
      url,
    });
  }

  async function handleShareDiagnostics() {
    const text =
      `App: ${appMeta.name}\nVersion: ${appMeta.version} (${appMeta.build})\n` +
      `Bundle ID: ${appMeta.bundleId}\nDevice: ${appMeta.deviceModel}\nOS: ${appMeta.os}`;
    try {
      if (await Sharing.isAvailableAsync()) {
        const path = FileSystem.cacheDirectory + "chatmal_diagnostics.txt";
        await FileSystem.writeAsStringAsync(path, text);
        await Sharing.shareAsync(path);
      } else {
        await Share.share({ title: "Diagnostics", message: text });
      }
    } catch {
      Alert.alert("Error", "Unable to share diagnostics.");
    }
  }

  async function handleClearCache() {
    try {
      setClearing(true);
      // Clear FileSystem caches (safe; won’t touch SecureStore or databases)
      const cacheDir = FileSystem.cacheDirectory!;
      const entries = await FileSystem.readDirectoryAsync(cacheDir);
      await Promise.all(
        entries.map(async (name) => {
          const p = cacheDir + name;
          try {
            const info = await FileSystem.getInfoAsync(p);
            if (info.exists) {
              if (info.isDirectory) {
                await FileSystem.deleteAsync(p, { idempotent: true });
              } else {
                await FileSystem.deleteAsync(p, { idempotent: true });
              }
            }
          } catch {
            // ignore individual failures
          }
        })
      );
      Alert.alert("Cleared", "Cached files were removed.");
    } catch {
      Alert.alert("Error", "Failed to clear cache. Try again.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">App Info</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 4 }}>
            {appMeta.name} · v{appMeta.version} ({appMeta.build})
          </ThemedText>
        </View>

        <SectionCard title="About">
          <InfoRow
            title="Website"
            subtitle={WEBSITE_URL.replace(/^https?:\/\//, "")}
            icon="globe-outline"
            onPress={() => openLink(WEBSITE_URL)}
          />
          <InfoRow
            title="Privacy Policy"
            subtitle="How we protect your data"
            icon="shield-checkmark-outline"
            onPress={() => openLink(PRIVACY_URL)}
          />
          <InfoRow
            title="Terms of Service"
            subtitle="Legal terms for using the app"
            icon="document-text-outline"
            onPress={() => openLink(TERMS_URL)}
          />
          <InfoRow
            title="Licenses"
            subtitle="Open-source libraries we use"
            icon="reader-outline"
            onPress={() => openLink(LICENSES_URL)}
          />
        </SectionCard>

        <SectionCard title="Support">
          <InfoRow
            title="Contact Support"
            subtitle="info.chatmal@gmail.com"
            icon="mail-outline"
            onPress={() =>
              openLink(
                "mailto:info.chatmal@gmail.com?subject=Support%20Request&body=Describe%20your%20issue..."
              )
            }
          />
          <InfoRow
            title="Share Diagnostics"
            subtitle="App version & device info"
            icon="share-outline"
            onPress={handleShareDiagnostics}
          />
        </SectionCard>

        <SectionCard title="Actions">
          <InfoRow title="Rate App" icon="star-outline" onPress={handleRate} />
          <InfoRow
            title="Share App"
            subtitle="Invite friends to Chat Mal"
            icon="send-outline"
            onPress={handleShareApp}
          />
          <InfoRow
            title="Clear Cache"
            subtitle="Remove temporary files"
            icon="trash-outline"
            onPress={handleClearCache}
            trailing={
              <ThemedText style={{ opacity: 0.7 }}>
                {clearing ? "Clearing..." : ""}
              </ThemedText>
            }
          />
        </SectionCard>

        <SectionCard title="Device">
          <InfoRow
            title="Device"
            subtitle={appMeta.deviceModel}
            icon="phone-portrait-outline"
          />
          <InfoRow
            title="OS"
            subtitle={appMeta.os}
            icon="hardware-chip-outline"
          />
          <InfoRow
            title="Bundle ID"
            subtitle={appMeta.bundleId!}
            icon="cube-outline"
          />
        </SectionCard>

        <ThemedButton
          title={"Contact Support"}
          isLoading={false}
          style={{ marginTop: 8, alignItems: "center" }}
          onPress={() =>
            openLink(
              "mailto:info.chatmal@gmail.com?subject=Support%20Request&body=Describe%20your%20issue..."
            )
          }
        />

        <ThemedText style={[styles.footer, { color: color.tertiaryText }]}>
          © {new Date().getFullYear()} Chat Mal
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  scroll: { paddingBottom: 60, paddingTop: 30 },
  header: { alignItems: "center", marginBottom: 20 },
  footer: { textAlign: "center", marginTop: 20, fontSize: 12 },
});
