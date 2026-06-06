"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

const PriceContext = createContext<{ onSale?: boolean }>({ onSale: false });
export const usePriceContext = () => useContext(PriceContext);

interface PriceProps {
  className?: string;
  children: ReactNode;
  onSale?: boolean;
}

interface PriceValueProps {
  price?: number;
  currency?: string;
  variant?: "regular" | "sale";
  className?: string;
}

export type PriceType = {
  currency?: string;
  regular: number;
  sale?: number;
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatCurrency(value: number, currency = "USD", locale?: string) {
  const resolvedLocale = locale ?? (currency === "ZAR" ? "af-ZA" : "en-US");
  const key = `${resolvedLocale}-${currency}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(resolvedLocale, { style: "currency", currency }),
    );
  }
  return formatterCache.get(key)!.format(value);
}

const Price = ({ className, children, onSale }: PriceProps) => {
  return (
    <PriceContext.Provider value={{ onSale }}>
      <div className={cn("flex flex-wrap items-center gap-x-2", className)}>
        {children}
      </div>
    </PriceContext.Provider>
  );
};

const PriceValue = ({
  price,
  currency = "USD",
  variant = "regular",
  className,
}: PriceValueProps) => {
  const { onSale } = usePriceContext();

  if (price == null) return null;

  return (
    <span
      className={cn(
        "font-[var(--font-google-sans-flex)] leading-tight",
        variant === "regular"
          ? onSale
            ? "text-[0.75rem] font-normal text-[#94A3B8] line-through"
            : "text-base font-bold text-[#1C99D6]"
          : "text-base font-bold text-[#1C99D6]",
        className,
      )}
    >
      {formatCurrency(price, currency)}
    </span>
  );
};

export { Price, PriceValue };
