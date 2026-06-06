export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 pt-[220px] pb-16 md:pt-[180px]">
        <h1 className="text-4xl font-normal text-[#1E3A5F] mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains how Airconsstore (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects your personal information. We are committed to protecting your privacy and ensuring compliance with the Protection of Personal Information Act (POPIA) in South Africa.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our website and services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect the following types of personal information:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Personal Details:</strong> Full name, email address, phone number, and physical address</li>
              <li><strong>Order Information:</strong> Product selections, order history, installation addresses, and payment details</li>
              <li><strong>Account Information:</strong> Username, password (encrypted), and account preferences</li>
              <li><strong>Communication Data:</strong> Messages sent through our contact forms and WhatsApp</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              3. Why We Collect Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Processing and fulfilling your orders and service requests</li>
              <li>Sending order confirmations, updates, and delivery notifications</li>
              <li>Providing customer support and responding to your inquiries</li>
              <li>Improving our products, services, and user experience</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Complying with legal obligations and protecting against fraud</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              4. How We Protect Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Encryption:</strong> All data is encrypted using Supabase's built-in encryption</li>
              <li><strong>Access Control:</strong> Row Level Security (RLS) policies ensure only authorized access</li>
              <li><strong>Payment Security:</strong> We do not store credit card details. All payments are processed through PCI-compliant payment gateways (PayFast, Yoco)</li>
              <li><strong>Secure Storage:</strong> Your data is stored in secure, SOC 2 compliant data centers</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              5. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Under POPIA, you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Right to Object:</strong> Object to the processing of your personal information</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the details provided below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              6. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services to operate our business:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>PayFast &amp; Yoco:</strong> PCI-compliant payment processing (we do not store card data)</li>
              <li><strong>Resend:</strong> Transactional email delivery for order notifications</li>
              <li><strong>CallMeBot:</strong> WhatsApp messaging for customer communications</li>
              <li><strong>Supabase:</strong> Database and authentication services with enterprise-grade security</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              7. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or your personal information, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> privacy@airconsstore.co.za</p>
              <p><strong>Phone:</strong> 082 123 4567</p>
              <p><strong>Address:</strong> Cape Town, South Africa</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will respond to your request within 30 days as required by POPIA.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the &quot;Last Updated&quot; date.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Last Updated:</strong> January 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
