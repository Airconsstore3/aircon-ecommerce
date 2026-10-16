"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useMemo } from "react";

const COMMERCIAL_IMAGES = [
  {
    src: "/Hero Images/Featured In section/Promo sales aircons/samsung-dvm-s2.png",
    alt: "Samsung commercial air conditioning system",
  },
  {
    src: "/Hero Images/Product category pictures/Daikin Sky Air Cassette Inverter.webp",
    alt: "Daikin commercial ceiling cassette air conditioner",
  },
  {
    src: "/Hero Images/Product category pictures/Alliance Duct Light Commercial Inverter.webp",
    alt: "Alliance light commercial ducted air conditioner",
  },
];

export function CommercialHeroCarousel() {
  const autoplay = useMemo(
    () => Autoplay({ delay: 4000, playOnInit: true, stopOnInteraction: false, stopOnMouseEnter: true }),
    [],
  );
  const [emblaRef] = useEmblaCarousel({ loop: true }, [autoplay]);

  return (
    <div ref={emblaRef} aria-label="Commercial air conditioning systems" className="h-full overflow-hidden">
      <div className="flex h-full">
        {COMMERCIAL_IMAGES.map((image) => (
          <div key={image.src} className="relative min-w-0 flex-[0_0_100%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1440px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
              className="scale-125 object-contain drop-shadow-[0_12px_10px_rgba(10,37,64,0.12)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
