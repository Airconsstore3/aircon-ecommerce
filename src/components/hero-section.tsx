import { ArrowRight, ArrowUpRight, Snowflake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CommercialHeroCarousel } from "@/components/CommercialHeroCarousel";
import { ResidentialHeroCarousel } from "@/components/ResidentialHeroCarousel";
import type { HeroProduct } from "@/lib/fetch-featured-products";

interface HeroSectionProps {
  className?: string;
  residentialProducts?: HeroProduct[];
}

const textLinkClass = "inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm text-[13px] font-semibold text-[#0A2540] transition-colors hover:text-[#1478A8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C99D6]";
const labelClass = "relative z-10 inline-flex w-fit items-center gap-1.5 rounded-md bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-[#335B74]";

const HeroSection = ({ className, residentialProducts = [] }: HeroSectionProps) => {
  return (
    <section aria-labelledby="storefront-hero-heading" className={cn("storefront-hero mx-auto max-w-[1440px] px-4 pb-2 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8", className)}>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[204px_204px]">
        <article className={cn("relative isolate flex flex-col overflow-hidden rounded-2xl p-6 sm:col-span-2 sm:p-8 lg:col-span-1 lg:row-span-2 xl:p-10", residentialProducts.length ? "min-h-[760px] lg:min-h-0" : "min-h-[400px] justify-center sm:min-h-[380px]")}>
          <span aria-hidden="true" className="absolute inset-0 -z-10">
            <Image src="/Hero Images/hero backgrounds/Residential hero.webp" alt="" fill priority sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
          </span>
          <div className="relative z-10 max-w-[75%] pt-3 sm:max-w-[48%]">
            <span className={labelClass}><Snowflake aria-hidden="true" className="size-3.5 text-[#1478A8]" />Comfort starts at home</span>
            <h1 id="storefront-hero-heading" className="mb-4 mt-5 text-[#0A2540]">Residential<br />Aircons</h1>
            <p className="max-w-[175px] text-[#335B74] sm:max-w-[230px]">Cool summers. Cosy winters. Find the right aircon for your home.</p>
            <Link href="/categories/residential" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0A2540] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#335B74] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A2540] sm:px-5">
              Shop Residential <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            {/* Secondary CTA — subtle text link, not a button.
                Sentence case, no underline by default, underline +
                4px arrow translation on hover. 28px above on mobile,
                32px on desktop. Left-aligned with hero content. */}
            <Link href="/products" className="hero-secondary-link mt-7 flex w-fit items-center gap-1 text-xs font-medium text-[#335B74] transition-colors hover:text-[#0A2540] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C99D6] md:mt-8">
              Browse all air conditioners <ArrowRight aria-hidden="true" className="hero-secondary-arrow size-3.5 shrink-0" />
            </Link>
          </div>
          {residentialProducts.length > 0 ? (
            <div className="relative z-10 mt-5 h-[420px] w-full sm:absolute sm:inset-y-0 sm:right-0 sm:m-0 sm:w-[52%] sm:px-6 lg:px-3">
              <ResidentialHeroCarousel products={residentialProducts} />
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[46%] sm:w-[52%]">
              <div className="absolute -left-2 top-[88px] h-[150px] w-full sm:left-0 sm:top-7 sm:h-[190px] lg:top-10">
                <Image src="/Hero Images/Product category pictures/Samsung AR80 WindFree front.webp" alt="Samsung WindFree wall-mounted residential air conditioner" fill priority sizes="(min-width: 1440px) 480px, (min-width: 1024px) 34vw, (min-width: 640px) 65vw, 90vw" className="object-contain drop-shadow-[0_12px_10px_rgba(10,37,64,0.12)] sm:scale-125" />
              </div>
              <div className="absolute bottom-10 right-0 h-[150px] w-full sm:bottom-5 sm:h-[230px]">
                <Image src="/Hero Images/Product category pictures/Samsung AR80 WindFree condenser front.webp" alt="Matching Samsung outdoor condenser unit" fill sizes="(min-width: 1440px) 480px, (min-width: 1024px) 34vw, (min-width: 640px) 65vw, 90vw" className="scale-125 object-contain mix-blend-multiply sm:scale-150" />
              </div>
            </div>
          )}
        </article>

        <article className="group relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-2xl p-6 sm:row-span-2 lg:min-h-0 lg:p-5 xl:p-6">
          <span aria-hidden="true" className="absolute inset-0 -z-10">
            <Image src="/Hero Images/hero backgrounds/Commercial hero.webp" alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
          </span>
          <span className={labelClass}>For your business</span>
          <div className="relative my-2 min-h-[150px] flex-1">
            <CommercialHeroCarousel />
          </div>
          <div className="relative">
            <h2 className="text-[#0A2540]">Commercial Aircons</h2>
            <p className="mt-2 text-[#335B74]">Powerful cooling for bigger spaces.</p>
            <Link href="/categories/commercial" className={cn(textLinkClass, "mt-2")}>Shop Commercial <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          </div>
        </article>

        <article className="group relative isolate flex min-h-[204px] flex-col overflow-hidden rounded-2xl p-6 lg:min-h-0 lg:p-5 xl:p-6">
          <span aria-hidden="true" className="absolute inset-0 -z-10">
            <Image src="/Hero Images/hero backgrounds/installation.webp" alt="" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
          </span>
          <span className={labelClass}>A complete setup</span>
          <h2 className="relative z-10 mt-3 max-w-[170px] text-[#0A2540]">Installation<br />Packages</h2>
          <div className="pointer-events-none absolute bottom-5 -right-4 h-[130px] w-[48%] sm:bottom-6 sm:-right-3">
            <Image src="/Hero Images/Product category pictures/Installation packages 2.png" alt="Air conditioner installation mounting kit" fill sizes="(min-width: 1440px) 200px, (min-width: 1024px) 15vw, 35vw" className="scale-150 object-contain drop-shadow-[0_8px_6px_rgba(10,37,64,0.12)] transition-transform duration-300 motion-safe:group-hover:scale-[1.6]" />
          </div>
          <Link href="/installation" className={cn(textLinkClass, "relative z-10 mt-auto")}>View Packages <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </article>

        <article className="group relative isolate flex min-h-[204px] flex-col overflow-hidden rounded-2xl p-6 lg:min-h-0 lg:p-5 xl:p-6">
          <span aria-hidden="true" className="absolute inset-0 -z-10">
            <Image src="/Hero Images/hero backgrounds/repairs and maintenece.webp" alt="" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
          </span>
          <span className={labelClass}>Keep it running right</span>
          <h2 className="relative z-10 mt-3 max-w-[175px] text-[#0A2540]">Repairs &<br />Maintenance</h2>
          <div className="pointer-events-none absolute -right-2 top-9 h-[125px] w-[53%]">
            <Image src="/Hero Images/Product category pictures/Daikin Perfera Split  2.webp" alt="Wall-mounted air conditioner for servicing and repair" fill sizes="(min-width: 1440px) 220px, (min-width: 1024px) 17vw, 40vw" className="scale-125 object-contain drop-shadow-[0_8px_6px_rgba(10,37,64,0.12)] transition-transform duration-300 motion-safe:group-hover:scale-[1.3]" />
          </div>
          <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-3">
            <Link href="/repairs" className={textLinkClass}>Repairs <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link>
            <Link href="/maintenance" className={textLinkClass}>Maintenance <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export { HeroSection };
