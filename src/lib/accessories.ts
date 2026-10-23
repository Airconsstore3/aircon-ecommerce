export const ACCESSORY_KINDS = [
  { value: "brackets", label: "Brackets" },
  { value: "installation-kits", label: "Installation kits" },
  { value: "wifi-modules", label: "Wi-Fi modules" },
  { value: "remotes", label: "Remotes" },
  { value: "pipes-trunking", label: "Pipes & trunking" },
];

export function isStorefrontAccessory(product: {
  type: string;
  name: string;
  specs?: Record<string, unknown> | null;
}): boolean {
  return ["accessory", "kit"].includes(product.type) &&
    ACCESSORY_KINDS.some((kind) => kind.value === product.specs?.accessory_kind) &&
    !/\b(pumps?|geysers?|warranty|maintenance|service)\b|residential installation/i.test(product.name);
}

export const INSTALLATION_KINDS = [
  { value: "installation-services", label: "Installation services" },
  ...ACCESSORY_KINDS.filter((kind) => ["installation-kits", "brackets", "pipes-trunking"].includes(kind.value)),
];

export function getInstallationKind(product: {
  type: string;
  name: string;
  specs?: Record<string, unknown> | null;
  categories?: { slug: string } | null;
}): string | null {
  if (!["accessory", "kit"].includes(product.type) || /\b(pumps?|geysers?|pools?|warranty|maintenance|repairs?)\b/i.test(product.name)) return null;
  const kind = product.specs?.accessory_kind;
  if (kind === "installation-services" || (product.type === "accessory" && product.categories?.slug === "installation" && /\b(?:de-?)?installation\b/i.test(product.name))) return "installation-services";
  return isStorefrontAccessory(product) && INSTALLATION_KINDS.some((option) => option.value === kind) ? String(kind) : null;
}

export function getAccessoryCardImage(product: {
  name?: string;
  images?: string[] | null;
  specs?: Record<string, unknown> | null;
}): { src: string; illustrative: boolean } | null {
  const photo = product.images?.find((src) => src && !src.includes("accessory-placeholder"));
  if (photo) return { src: photo, illustrative: false };
  if (product.specs?.accessory_kind === "brackets") {
    return { src: "/Hero Images/Product category pictures/550mm Brackets High Quality.png", illustrative: true };
  }
  if (product.specs?.accessory_kind === "installation-kits") {
    const material = String(product.specs?.material ?? "").toLowerCase();
    if (material === "copper") {
      return { src: "/Hero Images/Product category pictures/Copper Installation Kit.png", illustrative: true };
    }
    if (material === "aluminium") {
      return { src: "/Hero Images/Product category pictures/Aluminium Installation Kit.png", illustrative: true };
    }
    return { src: "/Hero Images/Product category pictures/Installation Packages.png", illustrative: true };
  }
  return null;
}

export const MAINTENANCE_KINDS = [
  { value: "maintenance-plans", label: "Maintenance plans" },
  { value: "warranty", label: "Extended warranty" },
  { value: "services", label: "Services & repairs" },
];

// Maintenance catalogue groups service-type accessory/kit products by name.
// These are deliberately excluded from the accessories catalogue by
// isStorefrontAccessory()'s warranty|maintenance|service name check.
export function getMaintenanceKind(product: {
  type: string;
  name: string;
  specs?: Record<string, unknown> | null;
}): string | null {
  if (!["accessory", "kit"].includes(product.type)) return null;
  const name = product.name;
  if (/\bmaintenance\b/i.test(name)) return "maintenance-plans";
  if (/\bwarranty\b/i.test(name)) return "warranty";
  if (/\b(services?|repairs?|callouts?|call-?outs?|re-?gas(?:sing)?|inspections?|cleaning)\b/i.test(name)) return "services";
  return null;
}

export function getAccessoryPrice(product: { price_zar: number; sale_price_zar?: number | null }): number {
  const sale = product.sale_price_zar;
  return sale != null && sale > 0 && sale < product.price_zar ? sale : product.price_zar;
}
