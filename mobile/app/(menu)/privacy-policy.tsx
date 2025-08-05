import {
  View,
  Linking,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";

import { Colors } from "@/constants/colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";

export default function PrivacyPolicy() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View style={styles.section}>
        <ThemedText type="larger" style={styles.sectionTitle}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: color.tertiaryText }]}>
          {children}
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText type="title">Privacy Policy</ThemedText>
          <ThemedText style={[styles.subtitle]}>
            Effective February 1, 2025
          </ThemedText>
        </View>

        {/* Main Card */}
        <View
          style={[styles.card, { backgroundColor: color.secondaryBackground }]}
        >
          <ThemedText type="large" style={styles.intro}>
            Welcome to <ThemedText type="link">Chat Mal</ThemedText>, your
            secure place for messaging and video calling. Here&apos;s how we
            protect your data.
          </ThemedText>

          <Section title="1. What We Collect">
            - Name, email, and profile photo{"\n"}- Messages and call history
            {"\n"}- Device information & usage data{"\n"}- Camera and microphone
            access
          </Section>

          <Section title="2. Why We Collect It">
            - To enable messaging & calls{"\n"}- Personalize your experience
            {"\n"}- Detect issues and improve performance{"\n"}- Comply with
            legal obligations
          </Section>

          <Section title="3. Your Choices">
            You can request access, update, or deletion of your data by yourself
            or contact us at {""}
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "mailto:info.chatmal@gmail.com?subject=Support Request from Chat Mal App"
                )
              }
            >
              <ThemedText style={styles.link} type="link">
                info.chatmal@gmail.com
              </ThemedText>
            </TouchableOpacity>
            .
          </Section>

          <Section title="4. Security">
            All your data is protected with strong encryption. Only authorized
            personnel have access.
          </Section>

          <Section title="5. External Services">
            We use services like Firebase & our own secure database, each with
            their own privacy practices.
          </Section>

          <Section title="6. Policy Updates">
            We may revise this policy occasionally. We&apos;ll notify you about
            major updates through the app.
          </Section>

          {/* Contact Button */}
          <ThemedButton
            title={"Contact Support"}
            isLoading={false}
            style={styles.button}
            onPress={() =>
              Linking.openURL(
                "mailto:info.chatmal@gmail.com?subject=Support Request from Chat Mal App"
              )
            }
          />

          <ThemedText style={styles.footer}>
            Last updated: February 1, 2025
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingBottom: 60,
    paddingTop: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    color: "gray",
    marginVertical: 5,
  },
  card: {
    borderRadius: 15,
    padding: 20,
  },
  intro: {
    marginBottom: 16,
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  paragraph: {
    lineHeight: 20,
  },
  link: {
    textDecorationLine: "underline",
  },
  button: {
    marginTop: 30,
    alignItems: "center",
  },
  footer: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 13,
    color: "gray",
  },
});
