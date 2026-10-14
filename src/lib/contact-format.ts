// Pure contact-format helpers — no server dependencies, safe to unit test
// and to use anywhere formatting (not fetching) is needed.

export interface ContactChannels {
  /** Verified WhatsApp digits for wa.me links (e.g. "27767100588"), or null when not configured. */
  whatsappDigits: string | null;
  /** Human-readable WhatsApp/phone number as stored in settings. */
  whatsappDisplay: string | null;
  /** tel: href value (e.g. "tel:+27215551234"), or null when not configured. */
  phoneTel: string | null;
  /** Human-readable phone number as stored in settings. */
  phoneDisplay: string | null;
  /** Verified contact email address, or null when not configured. */
  email: string | null;
  storeName: string | null;
}

/**
 * Normalise a stored WhatsApp number into the digits-only international format
 * wa.me requires: no "+", spaces, brackets or dashes, and including the country
 * code. A leading single "0" is treated as a South African local number and
 * replaced with the "27" country code (same rule as maintenance/page.tsx).
 * Returns null when the value is empty or has no plausible digits.
 */
export function normalizeWhatsAppDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits || !/[1-9]/.test(digits)) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `27${digits.slice(1)}`;
  return digits.length >= 9 ? digits : null;
}

/** Build a wa.me link from normalised digits with an optional prefilled message. */
export function buildWhatsAppHref(whatsappDigits: string, message?: string): string {
  const base = `https://wa.me/${whatsappDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a tel: href — keeps a leading "+" for international format, strips separators. */
export function buildTelHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${hasPlus ? "+" : ""}${digits}`;
}

/** First available contact href: WhatsApp → phone → email, or null if none configured. */
export function primaryContactHref(
  contact: Pick<ContactChannels, "whatsappDigits" | "phoneTel" | "email">,
  message?: string,
): string | null {
  if (contact.whatsappDigits) return buildWhatsAppHref(contact.whatsappDigits, message);
  if (contact.phoneTel) return contact.phoneTel;
  if (contact.email) return `mailto:${contact.email}`;
  return null;
}
