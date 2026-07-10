export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 pt-[220px] pb-16 md:pt-[180px]">
        <h1 className="text-4xl font-normal text-[#1E3A5F] mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains how Aircons Store collects, uses, stores, and protects personal information in line with South Africa's Protection of Personal Information Act (POPIA).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Contact details:</strong> name, phone number, and optional email address.</li>
              <li><strong>Request details:</strong> selected products, quantities, notes, delivery address details, installation timing preferences, and related context you choose to provide.</li>
              <li><strong>Technical security data:</strong> information needed to prevent spam and abuse, such as rate-limit signals and bot-protection results.</li>
              <li><strong>Consent data:</strong> your checkout consent choice and optional analytics cookie consent choice.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">3. Why We Collect Your Information</h2>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>To respond to your quote or checkout request.</li>
              <li>To prepare a confirmation slip and next-step instructions.</li>
              <li>To contact you by WhatsApp and/or email, depending on your selected contact method.</li>
              <li>To prevent spam, abuse, and unauthorized access.</li>
              <li>To measure lead conversions only after you opt in to optional analytics cookies.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">4. Services We Use</h2>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Supabase:</strong> database, authentication, Row Level Security, Edge Functions, and scheduled retention jobs.</li>
              <li><strong>Resend:</strong> transactional email notifications for quote requests and optional customer confirmations.</li>
              <li><strong>WhatsApp wa.me links:</strong> pre-filled WhatsApp messages opened by you in your browser or WhatsApp app.</li>
              <li><strong>Google Analytics / Google Ads:</strong> optional consent-based conversion tracking with hashed contact identifiers only.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">5. Analytics and Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              Non-essential analytics and advertising tags are denied by default and only run after you accept optional cookies. We do not place raw email addresses or phone numbers into Google Tag Manager, Google Analytics, or Google Ads payloads. Where enhanced lead attribution is used, contact identifiers are hashed with SHA-256 before being sent to Google tags.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">6. Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Submitted requests that do not convert are purged or anonymized after approximately 90 days. Confirmation links are intended for short-term customer access and expire after approximately 48 hours.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under POPIA, you may request access to, correction of, or deletion of your personal information, subject to applicable legal requirements. You may also object to processing or withdraw consent where consent is the basis for processing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">8. Contact Us</h2>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> privacy@airconsstore.co.za</p>
              <p><strong>Phone:</strong> 082 123 4567</p>
              <p><strong>Address:</strong> Cape Town, South Africa</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. The current version applies from the date shown below.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4"><strong>Last Updated:</strong> July 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
