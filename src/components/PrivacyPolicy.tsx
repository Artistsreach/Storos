import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support. This includes your name, email address, and any content
                you create using our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                2. Google Authentication
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use Google Authentication to secure your account. When you
                sign in with Google, we receive basic profile information
                including your name, email address, and profile picture. We do
                not store your Google password.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                3. Payment Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Payment processing is handled by Stripe. We do not store your
                credit card information on our servers. Stripe's privacy policy
                governs the collection and use of payment information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                4. How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                5. Information Sharing
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except as described in this policy.
                We may share information with service providers who assist us in
                operating our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                6. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to collect and
                use personal information about you. You can control cookies
                through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                8. Your Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the right to access, update, or delete your personal
                information. You may also opt out of certain communications from
                us. To exercise these rights, please contact us at
                info@freshfront.co.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                11. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at info@freshfront.co.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
