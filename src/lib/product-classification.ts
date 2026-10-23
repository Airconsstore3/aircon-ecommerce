export function deriveAcType(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("vrf")) return "VRF";
  if (lower.includes("portable")) return "Portable";
  if (lower.includes("window") || lower.includes("window wall")) return "Window Wall";
  if (lower.includes("mini cassette") || lower.includes("mini-cassette")) return "Mini Cassette";
  if (lower.includes("cassette")) return "Cassette";
  if (lower.includes("underceiling") || lower.includes("under ceiling") || lower.includes("ceiling suspended") || lower.includes("floor/ceiling")) return "Under Ceiling";
  if (lower.includes("floor standing") || lower.includes("floor ceiling") || (lower.includes("floor") && lower.includes("standing"))) return "Floor Standing";
  if (lower.includes("ceiling concealed") || (lower.includes("ceiling") && lower.includes("concealed"))) return "Ceiling Concealed";
  if (lower.includes("ducted") || lower.includes("duct type") || lower.includes("hide away")) return "Ducted";
  if (lower.includes("package") || lower.includes("rooftop")) return "Package Unit";
  if (lower.includes("split") || lower.includes("midwall") || lower.includes("mid wall") || lower.includes("wall-mounted") || lower.includes("wall mount") || /\bRAC\b/i.test(name)) return "Split System";
  return null;
}

export function deriveIsInverter(name: string, specs?: Record<string, unknown>): boolean {
  if (specs?.inverter === true || specs?.inverter === "Yes") return true;
  if (specs?.inverter === false || specs?.inverter === "No") return false;
  const lower = name.toLowerCase();
  if (lower.includes("non-inverter") || lower.includes("non inverter")) return false;
  return lower.includes("inverter");
}
