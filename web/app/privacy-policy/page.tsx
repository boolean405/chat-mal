// app/privacy-policy/page.tsx
import type { Metadata } from "next";
import Section from "@/components/legal/Section";
import {
  APP_NAME,
  CS_EMAIL,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_LAST_UPDATED,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Chat Mal collects, uses, and protects your information across messaging, calls, payments, and stories.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How Chat Mal collects, uses, and protects your information across messaging, calls, payments, and stories.",
    type: "article",
    url: "/privacy-policy",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Effective {PRIVACY_EFFECTIVE_DATE}
        </p>
      </header>

      {/* Card */}
      <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-base leading-7 text-neutral-700 dark:text-neutral-200">
          Welcome to <span className="font-medium">{APP_NAME}</span>, your
          secure place for messaging, video calling, payments, and sharing
          stories. Here’s how we protect your data.
        </p>

        <Section title="1. What We Collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>Name, email, and profile photo</li>
            <li>Messages, calls, and story uploads</li>
            <li>Device information (model, OS, identifiers)</li>
            <li>Payment-related data (tokenized, never stored)</li>
            <li>Location (only with your permission)</li>
          </ul>
        </Section>

        <Section title="2. Why We Collect It">
          <ul className="list-disc pl-5 space-y-1">
            <li>Enable chat, calls, and content sharing</li>
            <li>Improve app performance and personalization</li>
            <li>Detect and prevent fraud and abuse</li>
            <li>Provide support and respond to inquiries</li>
            <li>Comply with legal and payment regulations</li>
          </ul>
        </Section>

        <Section title="3. Your Choices">
          <ul className="list-disc pl-5 space-y-1">
            <li>Access, update, or delete personal data in settings</li>
            <li>
              Disable camera, mic, or location access via device permissions
            </li>
            <li>Contact us anytime to delete or update your data</li>
          </ul>
        </Section>

        <Section title="4. Security">
          <ul className="list-disc pl-5 space-y-1">
            <li>End-to-end encryption for chats and calls</li>
            <li>TLS/SSL for all network traffic</li>
            <li>Restricted access to data for authorized personnel only</li>
          </ul>
        </Section>

        <Section title="5. Payment Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Payments processed by trusted third parties (e.g., Stripe, PayPal)
            </li>
            <li>We do not store credit card or banking information</li>
            <li>
              Transaction history retained for legal and support purposes
            </li>
          </ul>
        </Section>

        <Section title="6. Stories & Media Content">
          <ul className="list-disc pl-5 space-y-1">
            <li>Stories are visible to your selected audience</li>
            <li>You can delete your stories at any time</li>
            <li>Media content is encrypted and stored securely</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <ul className="list-disc pl-5 space-y-1">
            <li>Messages and call logs are retained unless deleted by you</li>
            <li>Inactive accounts may be removed after extended inactivity</li>
            <li>Some data may be retained for legal or regulatory compliance</li>
          </ul>
        </Section>

        <Section title="8. External Services">
          <ul className="list-disc pl-5 space-y-1">
            <li>We integrate with Firebase and third-party APIs</li>
            <li>Those services have their own privacy policies to review</li>
          </ul>
        </Section>

        <Section title="9. Children’s Privacy">
          <ul className="list-disc pl-5 space-y-1">
            <li>Not intended for users under 13</li>
            <li>No knowing collection from children without parental consent</li>
          </ul>
        </Section>

        <Section title="10. Policy Updates">
          <p>
            We may update this policy. Major changes will be communicated in-app
            or via email. Continued use of {APP_NAME} indicates acceptance of
            the new policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            Questions or concerns? Email{" "}
            <a
              className="underline underline-offset-4 hover:opacity-80"
              href={`mailto:${CS_EMAIL}?subject=Support%20Request&body=Describe%20your%20issue...`}
            >
              {CS_EMAIL}
            </a>
            .
          </p>
        </Section>

        <footer className="mt-8 text-center text-xs text-neutral-500">
          Last updated: {PRIVACY_LAST_UPDATED}
        </footer>
      </article>
    </main>
  );
}
