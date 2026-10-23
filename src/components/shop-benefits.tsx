import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  image: string;
  color: string;
}

const BRANDS: Brand[] = [
  { id: "samsung", name: "Samsung", image: "/Hero Images/aircon coursel logo/samsung aircon.png", color: "#1428A0" },
  { id: "alliance", name: "Alliance", image: "/Hero Images/aircon coursel logo/alliance aircon.png", color: "#0093D0" },
  { id: "daikin", name: "Daikin", image: "/Hero Images/aircon coursel logo/daikin aircon.png", color: "#0090DA" },
  { id: "midea", name: "Midea", image: "/Hero Images/aircon coursel logo/midea aircon.png", color: "#0072CE" },
  { id: "hisense", name: "Hisense", image: "/Hero Images/aircon coursel logo/hisense aircon.png", color: "#00857C" },
];

const ShopBenefits = () => {
  return (
    <section aria-labelledby="shop-benefits-heading" className="mx-auto max-w-[1440px] px-4 pb-10 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <div className="text-center">
        <h2 id="shop-benefits-heading" className="text-[#0A2540]">Everything your aircon needs, in one place</h2>
        <p className="mx-auto mt-3 max-w-[520px] text-sm text-[#0A2540] sm:text-[15px]">
          Free Cape Town delivery, professional installation support and aftercare on every unit, from trusted brands.
        </p>
      </div>
      <ul aria-label="Brands we supply" className="mx-auto mt-10 flex max-w-[900px] flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-12">
        {BRANDS.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/products?brand=${brand.id}`}
              aria-label={`Shop ${brand.name} air conditioners`}
              className="group flex h-10 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C99D6]"
            >
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: brand.color,
                  WebkitMaskImage: `url("${brand.image}")`,
                  maskImage: `url("${brand.image}")`,
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
                className="block h-8 w-32 transition-transform duration-300 motion-safe:group-hover:scale-105 sm:h-9"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export { ShopBenefits };
