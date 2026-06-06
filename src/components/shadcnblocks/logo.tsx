"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  className?: string;
  children: React.ReactNode;
}

export function Logo({ url, className, children }: LogoProps) {
  const Component = url ? "a" : "div";
  return (
    <Component
      href={url}
      className={cn("flex items-center gap-2", className)}
    >
      {children}
    </Component>
  );
}

export function LogoImage({
  src,
  alt,
  className,
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={className} />;
}

export function LogoTextDesktop({
  className,
  children,
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={className}>{children}</span>;
}
