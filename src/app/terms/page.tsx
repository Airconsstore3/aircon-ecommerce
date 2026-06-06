export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 pt-[220px] pb-16 md:pt-[180px]">
        <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8">
          Terms and Conditions
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              1. Service Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Airconsstore (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides air conditioning installation, maintenance, and repair services (&quot;Services&quot;) in Cape Town, South Africa. By engaging our Services, you agree to these terms and conditions.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Installation Services
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Installation services include unit mounting, refrigerant piping, electrical connections, and system testing. We guarantee professional installation by certified technicians. Installation typically takes 4-6 hours depending on unit complexity.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Maintenance Services
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Maintenance services include filter cleaning, gas level checks, drainage inspection, thermostat calibration, and performance reporting. Scheduled maintenance visits are conducted according to the purchased plan frequency.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              2. Payment Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All payments are processed through PayFast, a PCI-compliant payment gateway. We do not store credit card information on our servers.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Deposit Requirement
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A 50% deposit is required for all installation services before work commences. The remaining balance is due upon completion and successful testing of the installation.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Maintenance Plans
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Maintenance plans are billed annually in advance. Plan fees are non-refundable once the first service visit has been completed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              3. Cancellation Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cancellations must be made at least 24 hours before the scheduled installation or service visit. Cancellations made within 24 hours may incur a 20% cancellation fee.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Installation Cancellations
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              For installation cancellations, the 50% deposit is refundable if cancelled more than 24 hours before the scheduled appointment. Cancellations within 24 hours will forfeit 20% of the deposit.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              Maintenance Plan Cancellations
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Maintenance plans can be cancelled at any time. We will refund the prorated amount for any unused service visits. No refunds are provided for visits already completed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              4. Warranty Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We provide warranty coverage on our workmanship and installed units according to the manufacturer's warranty terms.
            </p>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              What is Covered
            </h3>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Installation workmanship for 12 months from date of installation</li>
              <li>Manufacturer defects on new units (per manufacturer warranty)</li>
              <li>Refrigerant leaks caused by installation defects</li>
              <li>Electrical connection failures caused by installation defects</li>
            </ul>
            <h3 className="text-lg font-semibold text-[#1E3A5F] mt-4 mb-2">
              What is Not Covered
            </h3>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Damage caused by improper use or neglect</li>
              <li>Normal wear and tear on filters and components</li>
              <li>Damage from power surges or electrical issues beyond our control</li>
              <li>Unauthorized modifications or repairs by third parties</li>
              <li>Acts of nature (lightning, flooding, etc.)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              5. Liability Limitations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Airconsstore shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our Services, including but not limited to loss of profits, data, or business interruption.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability for any claim shall not exceed the amount paid for the specific Service giving rise to the claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              6. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms and conditions are governed by the laws of the Republic of South Africa. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the South African courts.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              7. Changes to These Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our Services constitutes acceptance of any modified terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Last Updated:</strong> January 2025
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-4">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these terms and conditions, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> info@airconsstore.co.za</p>
              <p><strong>Phone:</strong> 082 123 4567</p>
              <p><strong>Address:</strong> Cape Town, South Africa</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
