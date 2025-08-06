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

export default function TermsOfService() {
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
          <ThemedText type="title">Terms of Service</ThemedText>
          <ThemedText style={styles.subtitle}>
            Effective February 1, 2025
          </ThemedText>
        </View>

        {/* Main Content Card */}
        <View
          style={[styles.card, { backgroundColor: color.secondaryBackground }]}
        >
          <ThemedText type="large" style={styles.intro}>
            By using <ThemedText type="link">Chat Mal</ThemedText>, you agree to
            the terms outlined below. Please read them carefully.
          </ThemedText>

          <Section title="1. Eligibility">
            You must be at least 13 years old to use Chat Mal. If you&apos;re
            under the age of majority in your country, your parent or guardian
            must agree to these terms on your behalf.
          </Section>

          <Section title="2. Account Responsibilities">
            - Keep your account secure and confidential.{"\n"}- You are
            responsible for all activities under your account.{"\n"}- Report any
            unauthorized access immediately.
          </Section>

          <Section title="3. Acceptable Use">
            You agree not to use Chat Mal for:
            {"\n"}- Illegal, harmful, or violent content{"\n"}- Harassment or
            hate speech{"\n"}- Sending spam or malware{"\n"}- Impersonating
            others
          </Section>

          <Section title="4. Payments & Transactions">
            - Payments are final unless otherwise stated.{"\n"}- You agree to
            use valid and authorized payment methods.{"\n"}- Chat Mal is not
            responsible for third-party processing delays or fees.
          </Section>

          <Section title="5. Stories & User Content">
            - You retain rights to your stories and messages.{"\n"}- By
            uploading content, you grant us limited rights to display and
            distribute it within the app.{"\n"}- We reserve the right to remove
            content that violates our policies.
          </Section>

          <Section title="6. Termination">
            We may suspend or terminate your access if you violate these terms
            or use the app in harmful ways.
          </Section>

          <Section title="7. Liability">
            Chat Mal is provided &quot;as-is&quot; without warranties. We are
            not liable for:
            {"\n"}- Lost data{"\n"}- Service interruptions{"\n"}- Unauthorized
            access{"\n"}- Damages resulting from your use of the app
          </Section>

          <Section title="8. Updates to Terms">
            We may update these terms from time to time. Material changes will
            be communicated in-app or via email.
          </Section>

          <Section title="9. Contact Us">
            If you have questions or concerns, contact us at{" "}
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "mailto:info.chatmal@gmail.com?subject=Terms of Service Inquiry"
                )
              }
            >
              <ThemedText style={styles.link} type="link">
                info.chatmal@gmail.com
              </ThemedText>
            </TouchableOpacity>
            .
          </Section>

          {/* Contact Button */}
          <ThemedButton
            title={"Contact Support"}
            isLoading={false}
            style={styles.button}
            onPress={() =>
              Linking.openURL(
                "mailto:info.chatmal@gmail.com?subject=Terms of Service Inquiry"
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
