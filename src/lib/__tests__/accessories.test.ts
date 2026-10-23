import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ACCESSORY_KINDS, getAccessoryPrice, getAccessoryCardImage, getInstallationKind, isStorefrontAccessory } from "../accessories";
import { filterProducts } from "../filterProducts";

const bracket = {
  type: "accessory",
  name: "Outdoor Unit Bracket Set — 450mm",
  specs: { accessory_kind: "brackets" },
};

describe("Accessory catalogue", () => {
  it("includes explicitly classified physical accessories", () => {
    expect(isStorefrontAccessory(bracket)).toBe(true);
    expect(isStorefrontAccessory({ ...bracket, type: "kit", name: "3m Copper Installation Kit", specs: { accessory_kind: "installation-kits" } })).toBe(true);
  });

  it.each(["Eckerle Condensate Pump", "ITS Geyser Installation Kit", "Heat Pump Bracket Set", "Annual Maintenance Plan", "1-Year Extended Warranty Plan", "Standard Residential Installation"])("excludes %s even if misclassified", (name) => {
    expect(isStorefrontAccessory({ ...bracket, name })).toBe(false);
  });

  it("excludes aircons, service rows and unclassified accessories", () => {
    expect(isStorefrontAccessory({ ...bracket, type: "aircon" })).toBe(false);
    expect(isStorefrontAccessory({ ...bracket, specs: { accessory_kind: "services" } })).toBe(false);
    expect(isStorefrontAccessory({ ...bracket, specs: undefined })).toBe(false);
  });
});

describe("All aircons query", () => {
  it("requests only published parent air conditioners", async () => {
    const aircon = { type: "aircon", name: "Split Air Conditioner" };
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (result: unknown) => unknown) => Promise.resolve(resolve({ data: [aircon], error: null })),
    };
    const client = { from: vi.fn().mockReturnValue(query) };
    const products = await filterProducts(client as unknown as SupabaseClient, "all-aircon");
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
    expect(query.eq).toHaveBeenCalledWith("is_parent_product", true);
    expect(query.eq).toHaveBeenCalledWith("type", "aircon");
    expect(products).toEqual([aircon]);
  });
});

describe("Accessory query", () => {
  it("requests only published parent physical accessories and rejects misclassified rows", async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: (resolve: (result: unknown) => unknown) => Promise.resolve(resolve({ data: [bracket, { ...bracket, name: "Geyser kit" }], error: null })),
    };
    const client = { from: vi.fn().mockReturnValue(query) };
    const products = await filterProducts(client as unknown as SupabaseClient, "accessories");
    expect(client.from).toHaveBeenCalledWith("products");
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
    expect(query.eq).toHaveBeenCalledWith("is_parent_product", true);
    expect(query.in).toHaveBeenCalledWith("type", ["accessory", "kit"]);
    expect(query.in).toHaveBeenCalledWith("specs->>accessory_kind", ACCESSORY_KINDS.map((kind) => kind.value));
    expect(products).toEqual([bracket]);
  });
});

describe("Installation catalogue", () => {
  const service = { type: "accessory", name: "Standard Residential Installation", categories: { slug: "installation" } };

  it("includes installation services, brackets and classified kits", () => {
    expect(getInstallationKind(service)).toBe("installation-services");
    expect(getInstallationKind(bracket)).toBe("brackets");
    expect(getInstallationKind({ ...bracket, name: "3m Copper Kit", specs: { accessory_kind: "installation-kits" } })).toBe("installation-kits");
  });

  it.each(["Swimming Pool Heat Pump Installation", "Geyser Installation", "Condensate Pump", "Annual Maintenance", "Extended Warranty", "Aircon Repair"])("excludes %s from installation", (name) => {
    expect(getInstallationKind({ ...service, name })).toBeNull();
  });

  it("excludes remotes, Wi-Fi modules, aircons and unclassified products", () => {
    expect(getInstallationKind({ ...bracket, specs: { accessory_kind: "wifi-modules" } })).toBeNull();
    expect(getInstallationKind({ ...bracket, specs: { accessory_kind: "remotes" } })).toBeNull();
    expect(getInstallationKind({ ...service, type: "aircon" })).toBeNull();
    expect(getInstallationKind({ ...service, categories: null })).toBeNull();
  });

  it("queries published parent products and assigns display categories without mutating rows", async () => {
    const query = {
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
      then: (resolve: (result: unknown) => unknown) => Promise.resolve(resolve({ data: [service, bracket, { ...service, name: "Geyser Installation" }], error: null })),
    };
    const client = { from: vi.fn().mockReturnValue(query) };
    const products = await filterProducts(client as unknown as SupabaseClient, "installation");
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
    expect(query.eq).toHaveBeenCalledWith("is_parent_product", true);
    expect(query.in).toHaveBeenCalledWith("type", ["accessory", "kit"]);
    expect(products).toHaveLength(2);
    expect(products[0].specs.accessory_kind).toBe("installation-services");
    expect(service).not.toHaveProperty("specs");
  });
});

describe("Accessory card images", () => {
  it("uses the clear assembled-bracket illustration for bracket sizes", () => {
    expect(getAccessoryCardImage({ ...bracket, images: ["/accessory-placeholder.svg"] })).toEqual({ src: "/Hero Images/Product category pictures/550mm Brackets High Quality.png", illustrative: true });
    expect(getAccessoryCardImage({ ...bracket, name: "Outdoor Unit Bracket Set — 650mm", images: ["/accessory-placeholder.svg"] })).toEqual({ src: "/Hero Images/Product category pictures/550mm Brackets High Quality.png", illustrative: true });
  });

  it("uses the material-matched illustration for installation kits", () => {
    expect(getAccessoryCardImage({ specs: { accessory_kind: "installation-kits", material: "Copper" } })).toEqual({ src: "/Hero Images/Product category pictures/Copper Installation Kit.png", illustrative: true });
    expect(getAccessoryCardImage({ specs: { accessory_kind: "installation-kits", material: "Aluminium" } })).toEqual({ src: "/Hero Images/Product category pictures/Aluminium Installation Kit.png", illustrative: true });
    expect(getAccessoryCardImage({ specs: { accessory_kind: "installation-kits" } })).toEqual({ src: "/Hero Images/Product category pictures/Installation Packages.png", illustrative: true });
  });

  it.each(["remotes", "wifi-modules", "pipes-trunking"])("does not invent an image match for %s", (kind) => {
    expect(getAccessoryCardImage({ specs: { accessory_kind: kind }, images: ["/accessory-placeholder.svg"] })).toBeNull();
  });

  it("prioritises actual product photos, including after a placeholder", () => {
    expect(getAccessoryCardImage({ ...bracket, images: ["/accessory-placeholder.svg", "/actual-product.webp"] })).toEqual({ src: "/actual-product.webp", illustrative: false });
  });
});

describe("Accessory prices", () => {
  it("uses a valid sale price for display, sorting and filtering", () => {
    expect(getAccessoryPrice({ price_zar: 950, sale_price_zar: 799 })).toBe(799);
  });

  it.each([null, undefined, 0, -1, 1100])("ignores invalid sale price %s", (sale_price_zar) => {
    expect(getAccessoryPrice({ price_zar: 950, sale_price_zar })).toBe(950);
  });
});
