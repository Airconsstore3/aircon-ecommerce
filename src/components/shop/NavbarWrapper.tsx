"use client";

import { Navbar } from "@/components/shadcnblocks/navbar";
import {
  User,
  History,
  LogOut,
} from "lucide-react";

export function NavbarWrapper() {
  return (
    <Navbar
      home={{
        href: "/",
        logo: {
          src: "/Logo.svg",
          alt: "Aircons Store",
        },
      }}
      menu={[
        { label: "Latest Deals", href: "/products?sale=true" },
        { label: "All Aircons", href: "/products" },
        { label: "Residential", href: "/categories/residential" },
        { label: "Commercial", href: "/categories/commercial" },
        { label: "Installation", href: "/installation" },
        { label: "Maintenance", href: "/maintenance" },
        { label: "Repairs", href: "/repairs" },
        { label: "Warranty", href: "/categories/warranty" },
        { label: "Accessories", href: "/categories/accessories" },
        { label: "About Us", href: "/about" },
        { label: "Sale", href: "/products?sale=true" },
      ]}
      sideMenu={[
        [
          { label: "My Orders", href: "/account/orders", icon: History },
          { label: "My Warranties", href: "/account/warranties", icon: User },
          { label: "My Subscriptions", href: "/account/subscriptions", icon: User },
          { label: "My Profile", href: "/account/profile", icon: User },
          { label: "Sign Out", href: "#", icon: LogOut },
        ],
      ]}
    />
  );
}
