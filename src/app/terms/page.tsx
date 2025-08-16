export default function TermsPage() {
  const lastUpdated = "August 15, 2025";
  return (
    <main className="prose prose-neutral max-w-4xl mx-auto px-4 py-12">
      <h1>Terms of Service</h1>
      <p><strong>Last Updated:</strong> {lastUpdated}</p>

      <p>
        These Terms of Service (the "Terms") govern your access to and use of the
        Storos platform and related websites, applications, and services (collectively,
        the "Service"). By creating an account, accessing, or using the Service, you
        agree to be bound by these Terms. If you are using the Service on behalf of a
        business or other legal entity, you represent that you have authority to bind
        that entity, and "you" refers to that entity.
      </p>

      <h2>1. Overview</h2>
      <p>
        Storos enables business owners to create online stores, publish public store
        pages via shareable links, and collect payments from customers. The Service
        includes authentication for users and integrates with Stripe Connect to enable
        payments and payouts to participating business owners ("Sellers").
      </p>

      <h2>2. Eligibility and Accounts</h2>
      <ul>
        <li>You must be at least 18 years old and able to form a binding contract.</li>
        <li>You must provide accurate, complete registration information and keep it current.</li>
        <li>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</li>
        <li>We may suspend or terminate accounts for violation of these Terms or suspected fraudulent or unlawful activity.</li>
      </ul>

      <h2>3. Sellers and Stripe Connect</h2>
      <p>
        Sellers must connect a valid Stripe account to accept payments. Payment processing
        services are provided by Stripe and are subject to the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noreferrer">Stripe Connected Account Agreement</a>
        and the <a href="https://stripe.com/legal" target="_blank" rel="noreferrer">Stripe Services Agreement</a> (collectively, the "Stripe Terms"). By becoming a Seller and enabling payments, you agree to be bound by the Stripe Terms.
      </p>
      <ul>
        <li>Storos is not a bank, money transmitter, or payment processor; Stripe processes payments and payouts.</li>
        <li>Sellers are responsible for all fees charged by Stripe and any platform fees disclosed within the Service.</li>
        <li>Sellers authorize us and Stripe to share data necessary to provide payments and fraud prevention.</li>
        <li>Sellers must complete any required KYC/KYB verification and comply with Stripe’s prohibited and restricted activities.</li>
      </ul>

      <h2>4. Products, Pricing, Taxes, and Shipping</h2>
      <ul>
        <li>Sellers are solely responsible for listing products/services accurately, setting prices, and fulfilling orders.</li>
        <li>Sellers are responsible for assessing, collecting, and remitting any applicable taxes and complying with tax laws.</li>
        <li>Sellers are responsible for shipping, delivery terms, and any customer service obligations.</li>
        <li>Prohibited content: illegal goods, regulated items without authorization, dangerous materials, intellectual property violations, or any content prohibited by applicable law or Stripe.</li>
      </ul>

      <h2>5. Customer Purchases and Refunds</h2>
      <ul>
        <li>Customers purchase directly from Sellers. Storos provides the platform but is not the seller of record.</li>
        <li>Refunds and returns are handled by Sellers under their posted policies and applicable law. Where supported, Stripe may facilitate refunds via the Seller’s Stripe account.</li>
        <li>Chargebacks and disputes are the responsibility of Sellers; amounts may be debited from Seller balances.</li>
      </ul>

      <h2>6. Acceptable Use</h2>
      <ul>
        <li>Do not misuse the Service, interfere with its operation, or attempt to access it using a method not provided by us.</li>
        <li>Do not upload or sell content that is unlawful, infringing, defamatory, obscene, or otherwise objectionable.</li>
        <li>Do not attempt to circumvent fees, security, or Stripe Connect requirements.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <ul>
        <li>We and our licensors own all rights in the Service, including software, branding, and content we provide.</li>
        <li>Sellers retain rights in their product content and grant us a non-exclusive license to host, display, and distribute it to operate the Service.</li>
        <li>You may not copy, modify, reverse engineer, or create derivative works from the Service except as permitted by law.</li>
      </ul>

      <h2>8. Third-Party Services</h2>
      <p>
        The Service may integrate with third-party services (e.g., Stripe). Your use of third-party services is governed by their terms and privacy policies, and we are not responsible for those services.
      </p>

      <h2>9. Privacy</h2>
      <p>
        Our collection and use of personal data is described in our <a href="/privacy">Privacy Policy</a>. By using the Service, you consent to our data practices consistent with that policy.
      </p>

      <h2>10. Platform Fees</h2>
      <p>
        We may charge platform fees to Sellers or Customers, disclosed at the time of transaction or in your account settings. Fees are subject to change upon notice.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access with or without notice for any reason, including if you violate these Terms. Upon termination, sections intended to survive (including intellectual property, disclaimers, limitations of liability, indemnification, and dispute resolution) will remain in effect.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
      </p>

      <h2>13. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, WHETHER BASED IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US (IF ANY) IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Storos and its affiliates, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys’ fees) arising out of or related to your use of the Service, your violation of these Terms, or your violation of any rights of another.
      </p>

      <h2>15. Changes to the Service and Terms</h2>
      <p>
        We may modify the Service and these Terms at any time. If we make material changes, we will provide notice (e.g., by posting in-app or updating the date above). Your continued use after changes become effective constitutes acceptance of the updated Terms.
      </p>

      <h2>16. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction where our entity is organized, without regard to conflict of laws principles. Any dispute will be resolved exclusively in the courts located in that jurisdiction, unless otherwise required by law. You and we waive any right to a jury trial to the extent permitted by law.
      </p>

      <h2>17. Contact</h2>
      <p>
        Questions about these Terms? Contact us at <a href="mailto:support@storos.app">support@storos.app</a>.
      </p>

      <hr />
      <p className="text-xs">
        Note: This template is provided for convenience only and does not constitute legal advice. Consult legal counsel to tailor these Terms to your specific jurisdiction and business.
      </p>
    </main>
  );
}
