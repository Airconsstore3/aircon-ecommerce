import type { LucideIcon } from "lucide-react";
import { Gift, Headphones, RefreshCw, ShieldCheck } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type incentive = {
  title: string;
  icon: LucideIcon;
  text: string;
  id: string;
};

interface Incentives1Props {
  incentives?: incentive[];
  className?: string;
}

const INCENTIVES: incentive[] = [
  {
    id: "1",
    title: "Tech Assistance",
    text: "Mon - Sun, 24h support",
    icon: Headphones,
  },
  {
    id: "2",
    title: "Quick Exchanges",
    text: "Returns processed within 60 days",
    icon: RefreshCw,
  },
  {
    id: "3",
    title: "Premium Wrapping",
    text: "Free wrapping over $100",
    icon: Gift,
  },
  {
    id: "4",
    title: "Product Guarantee",
    text: "Zero hassle warranty",
    icon: ShieldCheck,
  },
];

const Incentives1 = ({
  incentives = INCENTIVES,
  className,
}: Incentives1Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <Carousel
          opts={{
            breakpoints: {
              "(min-width: 768px)": {
                active: false,
              },
            },
            align: "start",
          }}
        >
          <CarouselContent className="md:ml-0 md:grid md:grid-cols-[repeat(2,_minmax(12.5rem,_18.75rem))] md:justify-center md:gap-5 xl:grid-cols-[repeat(4,_minmax(12.5rem,_18.75rem))]">
            {incentives.map(({ title, icon: Icon, text, id }) => (
              <CarouselItem key={id} className="basis-75 md:pl-0">
                <div className="flex items-center gap-6">
                  <div className="shrink-0 basis-16">
                    <div className="flex size-16 place-content-center place-items-center rounded-full border">
                      <Icon className="w-10" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-base font-normal">{title}</h3>
                    <p className="text-sm">{text}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Incentives1 };
