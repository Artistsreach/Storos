export default function PrivacyPage() {
  const lastUpdated = "August 15, 2025";
  return (
    <main className="prose prose-neutral max-w-4xl mx-auto px-4 py-12">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated:</strong> {lastUpdated}</p>

      <p>
        This Privacy Policy explains how Storos ("we", "us", "our") collects, uses, shares,
        and protects personal information when you use our websites, applications, and
        services (the "Service"). By using the Service, you agree to the practices described
        in this Policy.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account & Authentication Data:</strong> Name, email, password (hashed), and any
          profile details you provide. If you sign in with third-party identity providers,
          we may receive identifiers and basic profile information from them.
        </li>
        <li>
          <strong>Seller/Stripe Connect Data:</strong> To enable payments for business owners ("Sellers"),
          we collect information required by Stripe to onboard and verify accounts (e.g., name,
          business details, tax IDs, banking details). Sensitive payment details are handled by Stripe,
          not Storos.
        </li>
        <li>
          <strong>Transactional Data:</strong> Order details, amounts, currency, status, refunds, and related
          communications between buyers and Sellers.
        </li>
        <li>
          <strong>Usage & Device Data:</strong> Log data such as IP address, device identifiers, browser type,
          pages viewed, referring/exit pages, timestamps, and approximate location derived from IP.
        </li>
        <li>
          <strong>Cookies & Similar Technologies:</strong> We use cookies and local storage to keep you signed in,
          remember preferences, enable analytics, and improve performance. See “Cookies” below.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>Provide, operate, and secure the Service, including authentication and account management.</li>
        <li>Enable Sellers to create stores, publish public pages, and accept payments via Stripe Connect.</li>
        <li>Process transactions, refunds, and payouts; detect, prevent, and investigate fraud or abuse.</li>
        <li>Personalize content and improve features, performance, and usability.</li>
        <li>Communicate with you about your account, transactions, updates, and support.</li>
        <li>Comply with legal obligations and enforce our Terms of Service.</li>
      </ul>

      <h2>3. Legal Bases for Processing</h2>
      <p>
        Where required (e.g., in the EEA/UK), we process personal data based on: (i) performance of a contract;
        (ii) our legitimate interests in providing and improving the Service and preventing fraud; (iii) compliance
        with legal obligations; and (iv) your consent where applicable (e.g., certain cookies/marketing).
      </p>

      <h2>4. Sharing of Information</h2>
      <ul>
        <li>
          <strong>Stripe:</strong> We share necessary data with Stripe to facilitate payments, onboarding,
          verification, refunds, chargebacks, and fraud prevention. Your use of payments is also governed by
          the <a href="https://stripe.com/legal" target="_blank" rel="noreferrer">Stripe Services Agreement</a>
          and <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noreferrer">Connected Account Agreement</a>.
        </li>
        <li>
          <strong>Service Providers:</strong> Hosting, analytics, email, customer support, and security vendors who
          access data only to perform services for us and are bound by confidentiality obligations.
        </li>
        <li>
          <strong>Sellers and Buyers:</strong> We share order and fulfillment details between buyers and Sellers as needed
          to process purchases and provide customer service.
        </li>
        <li>
          <strong>Legal & Safety:</strong> We may disclose information if required by law or to protect rights, property,
          safety of users or the public, and to prevent fraud or security issues.
        </li>
        <li>
          <strong>Business Transfers:</strong> In connection with a merger, acquisition, financing, or sale of assets,
          your information may be transferred as part of that transaction.
        </li>
      </ul>

      <h2>5. Cookies and Analytics</h2>
      <p>
        We use cookies and similar technologies for authentication, preferences, analytics, and performance. You can
        manage cookies via your browser settings. If we use third-party analytics (e.g., privacy-centric analytics),
        those providers may set cookies to help us understand usage patterns. Where required, we obtain consent.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal data for as long as necessary to provide the Service, comply with legal obligations, resolve
        disputes, and enforce agreements. Retention periods vary by data type and legal requirements.
      </p>

      <h2>7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect personal data. However, no method of
        transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. International Data Transfers</h2>
      <p>
        Your information may be stored and processed in countries other than your own. Where required, we use appropriate
        safeguards (e.g., Standard Contractual Clauses) for cross-border transfers.
      </p>

      <h2>9. Your Rights</h2>
      <p>
        Depending on your location, you may have rights such as access, correction, deletion, portability, objection,
        and restriction. You can exercise certain rights via your account settings or by contacting us. We may need to
        verify your identity to process requests. You also have the right to complain to your local data protection authority.
      </p>

      <h2>10. Children’s Privacy</h2>
      <p>
        The Service is not directed to children under 13 (or older minimum age as required by your jurisdiction). We do not
        knowingly collect personal information from children. If you believe a child provided us data, contact us to request deletion.
      </p>

      <h2>11. Third-Party Links</h2>
      <p>
        The Service may contain links to third-party websites and services. We are not responsible for their privacy practices.
        Review their policies before providing personal information.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. If changes are material, we will provide notice (e.g., in-app or
        by updating the date above). Your continued use of the Service after changes take effect indicates acceptance.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have questions or requests regarding this Privacy Policy or our data practices, contact us at
        <a href="mailto:privacy@storos.app"> privacy@storos.app</a>.
      </p>

      <hr />
      <p className="text-xs">
        Note: This template is provided for convenience only and does not constitute legal advice. Consult
        a qualified attorney to tailor this policy to your specific jurisdiction and business.
      </p>
    </main>
  );
}
