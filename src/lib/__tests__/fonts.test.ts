import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SRC = join(__dirname, "..", "..");

const readSource = (rel: string) => readFileSync(join(SRC, rel), "utf8");

describe("font performance guards", () => {
  it("Poppins is not configured or applied", () => {
    const layout = readSource("app/layout.tsx");
    expect(layout).not.toContain("Poppins");
    expect(layout).not.toContain("--font-poppins");
  });

  it("PP Neue Montreal is not configured globally", () => {
    const layout = readSource("app/layout.tsx");
    expect(layout).not.toContain("pp-neue-montreal");
    expect(layout).not.toContain("PPNeueMontreal");
  });

  it("Google Sans Flex ships as optimized WOFF2, not the 4MB TTF", () => {
    const layout = readSource("app/layout.tsx");
    expect(layout).toContain("GoogleSansFlex-Variable.woff2");
    expect(layout).not.toContain(".ttf");
  });

  it("orphan font files stay removed", () => {
    for (const f of [
      "fonts/PPNeueMontreal-Thin.woff2",
      "fonts/PPNeueMontreal-Book.woff2",
      "fonts/PPNeueMontreal-Italic.woff2",
      "fonts/PPNeueMontreal-Medium.woff2",
      "fonts/PPNeueMontreal-Bold.woff2",
    ]) {
      expect(existsSync(join(SRC, "..", f))).toBe(false);
    }
    expect(existsSync(join(SRC, "..", "Google_Sans_Flex/static"))).toBe(false);
  });

  it("only Inter and Google Sans Flex variables are on body", () => {
    const layout = readSource("app/layout.tsx");
    const bodyClass = layout.match(/<body className=\{`([^`]+)`\}/)?.[1] ?? "";
    expect(bodyClass).not.toContain("poppins");
    expect(bodyClass).not.toContain("pp-neue-montreal");
    expect(bodyClass).toContain("googleSansFlex.variable");
  });
});
