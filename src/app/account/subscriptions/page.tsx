import { CalendarCheck, MessageCircle, Phone, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  buildWhatsAppHref,
  getContactChannels,
} from "@/lib/contact-settings";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const contact = await getContactChannels();
  const whatsappHref = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I'm interested in a maintenance plan.")
    : null;

  // No customer subscription records exist yet — render an honest empty
  // state rather than fabricated plans.
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">
            My Subscriptions
          </h1>
          <p className="text-muted-foreground">
            View your maintenance plan subscriptions
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm p-12 border-0 text-center">
          <CalendarCheck className="size-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
            No active subscriptions
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You don&apos;t have any maintenance plan subscriptions yet. Browse
            our maintenance options or contact our team to set one up.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="rounded-lg" asChild>
              <Link href="/maintenance">View Maintenance Options</Link>
            </Button>
            {whatsappHref && (
              <Button
                className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                asChild
              >
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 size-4" aria-hidden="true" />
                  WhatsApp Us
                </a>
              </Button>
            )}
            {contact.phoneTel && (
              <Button variant="outline" className="rounded-lg" asChild>
                <a href={contact.phoneTel}>
                  <Phone className="mr-2 size-4" aria-hidden="true" />
                  Call Us
                </a>
              </Button>
            )}
            {contact.email && (
              <Button variant="outline" className="rounded-lg" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="mr-2 size-4" aria-hidden="true" />
                  Email Us
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
