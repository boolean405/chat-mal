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
import { CS_EMAIL } from "@/constants";

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
          <ThemedText style={styles.subtitle}>
            Effective February 1, 2025
          </ThemedText>
        </View>

        {/* Main Card */}
        <View
          style={[styles.card, { backgroundColor: color.secondaryBackground }]}
        >
          <ThemedText type="large" style={styles.intro}>
            Welcome to <ThemedText type="link">Chat Mal</ThemedText>, your
            secure place for messaging, video calling, payments, and sharing
            stories. Here&apos;s how we protect your data.
          </ThemedText>

          <Section title="1. What We Collect">
            - Name, email, and profile photo{"\n"}- Messages, calls, and story
            uploads{"\n"}- Device information (model, OS, identifiers){"\n"}-
            Payment-related data (tokenized, never stored){"\n"}- Location (only
            with your permission)
          </Section>

          <Section title="2. Why We Collect It">
            - To enable chat, calls, and content sharing{"\n"}- Improve app
            performance and personalization{"\n"}- Detect and prevent fraud and
            abuse{"\n"}- Provide support and respond to inquiries{"\n"}- Comply
            with legal and payment regulations
          </Section>

          <Section title="3. Your Choices">
            - You can access, update, or delete your personal data in settings.
            {"\n"}- You can disable camera, mic, or location access via your
            device permissions.{"\n"}- Contact us anytime to delete or update
            your data.
          </Section>

          <Section title="4. Security">
            - We use end-to-end encryption for chats and calls.{"\n"}- Secure
            socket layers (SSL) for all transactions.{"\n"}- Access to data is
            restricted to authorized personnel only.
          </Section>

          <Section title="5. Payment Information">
            - All payments are securely processed by trusted third-party
            providers (e.g. Stripe, PayPal).{"\n"}- We do not store your credit
            card or banking information.{"\n"}- Transaction history is kept for
            legal and support purposes.
          </Section>

          <Section title="6. Stories & Media Content">
            - Stories you upload are visible to your selected audience.{"\n"}-
            You can delete your stories at any time.{"\n"}- Media content is
            encrypted and stored securely.
          </Section>

          <Section title="7. Data Retention">
            - Messages and call logs are retained unless manually deleted.{"\n"}
            - Inactive accounts may be removed after a long period of
            inactivity.{"\n"}- Some data may be retained for legal or regulatory
            compliance.
          </Section>

          <Section title="8. External Services">
            - We integrate with Firebase and third-party APIs (e.g., Google,
            Apple){"\n"}- These services have their own privacy policies you
            should review.
          </Section>

          <Section title="9. Children’s Privacy">
            - Our services are not intended for users under 13.{"\n"}- We do not
            knowingly collect data from children without parental consent.
          </Section>

          <Section title="10. Policy Updates">
            We may update this policy. Major changes will be communicated
            through the app or via email. Continued use of Chat Mal indicates
            acceptance of the new policy.
          </Section>

          <Section title="11. Contact Us">
            If you have any questions or concerns about this policy, please
            reach out to us.
          </Section>

          {/* Contact Button */}
          <ThemedButton
            title={"Contact Support"}
            isLoading={false}
            style={styles.button}
            onPress={() =>
              Linking.openURL(
                `mailto:${CS_EMAIL}?subject=Support%20Request&body=Describe%20your%20issue...`
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
