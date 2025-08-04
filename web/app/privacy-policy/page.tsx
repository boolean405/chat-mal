export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0e0e10] text-white px-6 py-16 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: Feb 1, 2025
          </p>
        </header>

        {/* Sections */}
        <section className="space-y-12 text-gray-300 text-base leading-relaxed">
          {/* Introduction */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>Chat Mal</strong>. This Privacy Policy explains
              how we collect, use, and protect your information when you use our
              services. We are committed to protecting your privacy and ensuring
              transparency.
            </p>
          </div>

          {/* Data We Collect */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              2. Data We Collect
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Email address for account setup</li>
              <li>Encrypted message metadata (not content)</li>
              <li>Diagnostic and crash logs</li>
              <li>Device type and OS version</li>
              <li>Optional profile photo and display name</li>
            </ul>
          </div>

          {/* Use of Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              3. How We Use Your Information
            </h2>
            <p>We use your data strictly for:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Providing secure messaging</li>
              <li>Improving app performance</li>
              <li>Sending service-related notifications</li>
            </ul>
          </div>

          {/* Encryption */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              4. End-to-End Encryption
            </h2>
            <p>
              Messages sent via Chat Mal are fully end-to-end encrypted. This
              means only you and the recipient can read them — not even we can
              access your messages.
            </p>
          </div>

          {/* Sharing Policy */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              5. Data Sharing
            </h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent your data. We may
              share anonymized usage data to improve performance or comply with
              legal obligations.
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              6. Your Rights & Choices
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Access your data</li>
              <li>Request deletion of your account</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              7. Cookies
            </h2>
            <p>
              We use minimal cookies to store settings and preferences. No
              tracking cookies are used.
            </p>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              8. Children’s Privacy
            </h2>
            <p>
              Chat Mal is not intended for users under 13. We do not knowingly
              collect data from children.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              9. Updates to This Policy
            </h2>
            <p>
              We may occasionally update this policy. We will notify you of
              major changes in-app or on our website.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              10. Contact Us
            </h2>
            <p>
              For questions or concerns, contact us at{" "}
              <a
                href="mailto:support@chatmal.app"
                className="text-purple-400 hover:underline"
              >
                info.chatmal@gmail.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-gray-800"></div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Chat Mal. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
