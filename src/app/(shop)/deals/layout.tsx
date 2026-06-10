import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aircon Specials Cape Town | Winter Deals & Discounts",
  description: "Limited-time aircon specials and deals in Cape Town. Save on residential and commercial air conditioning units, installation bundles, and maintenance packages.",
  keywords: "aircon specials, aircon deals Cape Town, aircon discounts, winter aircon sale, aircon installation deals",
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
