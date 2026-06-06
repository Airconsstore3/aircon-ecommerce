import { Price, PriceValue } from "@/components/price";
import { Rating } from "@/components/rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Product {
  name: string;
  brand: string;
  image: {
    src: string;
    alt: string;
  };
  link: string;
  price: ProductPrice;
  rate: number;
}

interface PromoCard {
  image: string;
  title: string;
  cta: {
    label: string;
    link: string;
  };
  tagline: string;
}

type PromoCardProps = PromoCard;

type ProductCardProps = Product;

interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

type ProductList = Array<Product>;

const PROMO_CARD: PromoCard | null = null;

const PRODUCTS_LIST: ProductList = [];

interface ProductList4Props {
  className?: string;
}

const ProductList4 = ({ className }: ProductList4Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20 grid gap-7 md:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS_LIST.map((item, index) => (
          <ProductCard key={`product-list-4-card-${index}`} {...item} />
        ))}
      </div>
    </section>
  );
};

const PromoCard = ({ image, title, cta, tagline }: PromoCardProps) => {
  return (
    <Card
      style={{
        backgroundImage: `url(${image})`,
      }}
      className="relative flex h-full min-h-105 w-full min-w-47.5 flex-col justify-between gap-5 overflow-hidden rounded-md bg-cover bg-center bg-no-repeat p-7 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent lg:max-w-80 lg:bg-top"
    >
      <CardHeader className="z-10 p-0">
        <CardTitle className="mb-2.5 max-w-40 text-xl leading-tight font-medium dark:text-black">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-foreground dark:text-black">
          {tagline}
        </CardDescription>
      </CardHeader>
      <CardAction className="z-10 w-full">
        <Button asChild className="w-full">
          <a href={cta.link}>{cta.label}</a>
        </Button>
      </CardAction>
    </Card>
  );
};

const ProductCard = ({
  name,
  link,
  image,
  price,
  brand,
  rate,
}: ProductCardProps) => {
  const { regular, sale, currency } = price;

  return (
    <a href={link} className="block h-full w-full min-w-47.5 md:max-w-80">
      <Card className="group h-full min-h-105 gap-3.5 rounded-none border border-solid border-[#0A2540]/30 bg-transparent p-0 shadow-none">
        <CardHeader className="block p-0">
          <div className="h-80 w-full overflow-hidden rounded-md">
            <img
              src={image.src}
              alt={image.alt}
              className="block size-full object-cover object-center"
            />
          </div>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-2 p-0">
          <div className="mb-1.5 flex justify-between gap-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              {brand}
            </div>
            <Rating
              rate={rate}
              className="[&_svg]:size-3.5 [&_svg]:fill-yellow-500 [&_svg]:stroke-yellow-500 [&>div]:size-3.5"
            />
          </div>
          <CardTitle className="text-lg leading-tight font-semibold">
            {name}
          </CardTitle>
          <Price onSale={sale != null} className="text-lg font-semibold">
            <PriceValue price={regular} currency={currency} variant="regular" />
            <PriceValue price={sale} currency={currency} variant="sale" />
          </Price>
        </CardContent>
      </Card>
    </a>
  );
};

export { ProductList4 };
