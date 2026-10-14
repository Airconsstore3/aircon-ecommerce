// Server-only module — uses the service role client.
// Never import this file from a "use client" component.
import { serviceRoleClient } from "@/lib/supabase-service";
import {
  buildTelHref,
  normalizeWhatsAppDigits,
  type ContactChannels,
} from "@/lib/contact-format";

export {
  buildTelHref,
  buildWhatsAppHref,
  normalizeWhatsAppDigits,
  primaryContactHref,
} from "@/lib/contact-format";
export type { ContactChannels } from "@/lib/contact-format";

const EMPTY_CHANNELS: ContactChannels = {
  whatsappDigits: null,
  whatsappDisplay: null,
  phoneTel: null,
  phoneDisplay: null,
  email: null,
  storeName: null,
};

/**
 * Fetch verified contact channels from the settings table.
 * Uses the service role client because the settings table has RLS enabled
 * (server components/route handlers only). Missing values return null so
 * callers hide unavailable contact methods instead of inventing details.
 */
export async function getContactChannels(): Promise<ContactChannels> {
  try {
    const { data, error } = await serviceRoleClient
      .from("settings")
      .select("store_name, contact_email, contact_phone, whatsapp_number")
      .limit(1)
      .maybeSingle();

    if (error || !data) return EMPTY_CHANNELS;

    const whatsappDigits = normalizeWhatsAppDigits(data.whatsapp_number);
    const channels: ContactChannels = {
      whatsappDigits,
      whatsappDisplay: whatsappDigits ? (data.whatsapp_number ?? "").trim() || null : null,
      phoneTel: buildTelHref(data.contact_phone),
      phoneDisplay: data.contact_phone?.trim() || null,
      email: data.contact_email?.trim() || null,
      storeName: data.store_name?.trim() || null,
    };

    if (
      process.env.NODE_ENV === "development" &&
      !channels.whatsappDigits && !channels.phoneTel && !channels.email
    ) {
      console.warn(
        "[contact-settings] No contact channels configured in the settings table. " +
          "Set whatsapp_number, contact_phone or contact_email so contact CTAs can render.",
      );
    }

    return channels;
  } catch {
    return EMPTY_CHANNELS;
  }
}
