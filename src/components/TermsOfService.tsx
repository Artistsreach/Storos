import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using FreshFront (&quot;the Service&quot;), you
                accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                2. Description of Service
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                FreshFront is an AI-powered e-commerce platform that allows
                users to create and manage online storefronts. Our service
                includes website building tools, payment processing through
                Stripe, and various e-commerce features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                3. User Accounts and Authentication
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To access certain features of the Service, you must create an
                account. We use Google Authentication for secure login. You are
                responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your
                account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                4. Payment Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Payment processing is handled through Stripe. By using our
                payment services, you agree to Stripe's terms of service. All
                fees are non-refundable unless otherwise stated. We reserve the
                right to change our pricing at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                5. User Content and Conduct
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain ownership of content you create using our platform.
                However, you grant us a license to use, modify, and display your
                content as necessary to provide the Service. You agree not to
                use the Service for any unlawful purposes or to violate any
                applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                6. Intellectual Property
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Service and its original content, features, and
                functionality are owned by FreshFront and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In no event shall FreshFront be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                8. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account and bar access to the
                Service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                9. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                10. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please
                contact us at info@freshfront.co.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
