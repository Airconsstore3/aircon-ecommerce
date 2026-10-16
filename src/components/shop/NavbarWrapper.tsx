"use client";

import { Navbar } from "@/components/shadcnblocks/navbar";
import {
  User,
  History,
  LogOut,
} from "lucide-react";

import { signOut } from "@/app/(auth)/actions";

const withTechnology = (href: string) => [
  { label: "Inverter", href: `${href}&technology=inverter` },
  { label: "Non-Inverter", href: `${href}&technology=non-inverter` },
];

const allAirconTypes = [
  {
    label: "Midwall Split",
    href: "/products?type=split%20system",
    image: "/Hero Images/Product category pictures/JASA J-Smart Mid Wall font.webp",
    children: withTechnology("/products?type=split%20system"),
  },
  {
    label: "Portable",
    href: "/products?type=portable",
    image: "/Hero Images/Product category pictures/Alliance Portable.webp",
  },
  {
    label: "Floor Standing",
    href: "/products?type=floor%20standing",
    image: "/Hero Images/Product category pictures/Alliance Floor Standing Inverter.webp",
    children: withTechnology("/products?type=floor%20standing"),
  },
  {
    label: "Ceiling Cassette",
    href: "/products?type=cassette",
    image: "/Hero Images/Product category pictures/Daikin Sky Air Cassette Inverter.webp",
    children: withTechnology("/products?type=cassette"),
  },
  {
    label: "Under Ceiling",
    href: "/products?type=under%20ceiling",
    image: "/Hero Images/Product category pictures/Alliance Underceiling Inverter.webp",
    children: withTechnology("/products?type=under%20ceiling"),
  },
  {
    label: "Ceiling Cassette Mini",
    href: "/products?type=mini%20cassette",
    image: "/Hero Images/Product category pictures/Daikin Sky Air Mini Cassette Inverter  1.webp",
    children: withTechnology("/products?type=mini%20cassette"),
  },
  {
    label: "Window Wall",
    href: "/products?type=window%20wall",
    image: "/Hero Images/Product category pictures/Alliance Window Wall Heat Pump.webp",
  },
];

const residentialAirconTypes = allAirconTypes.map((item) => ({
  ...item,
  href: item.href.replace("/products", "/categories/residential"),
  children: item.children?.map((child) => ({
    ...child,
    href: child.href.replace("/products", "/categories/residential"),
  })),
}));

const residentialBtuOptions = [
  { label: "Shop 9 000 BTU", href: "/categories/residential?btu=9000" },
  { label: "Shop 12 000 BTU", href: "/categories/residential?btu=12000" },
  { label: "Shop 18 000 BTU", href: "/categories/residential?btu=18000" },
  { label: "Shop 24 000 BTU", href: "/categories/residential?btu=24000" },
];

const allBtuOptions = [
  { label: "Shop 9 000 BTU", href: "/products?btu=9000" },
  { label: "Shop 12 000 BTU", href: "/products?btu=12000" },
  { label: "Shop 18 000 BTU", href: "/products?btu=18000" },
  { label: "Shop 24 000 BTU", href: "/products?btu=24000" },
];

const commercialBtuOptions = [
  { label: "Shop 36 000 BTU", href: "/categories/commercial?btu=36000" },
  { label: "Shop 48 000 BTU", href: "/categories/commercial?btu=48000" },
  { label: "Shop 60 000 BTU", href: "/categories/commercial?btu=60000" },
  { label: "Shop 90 000 BTU", href: "/categories/commercial?btu=90000" },
];

const brandOptions = [
  { label: "Samsung", href: "/products?brand=samsung", image: "/Hero Images/aircon coursel logo/samsung aircon.png" },
  { label: "LG", href: "/products?brand=lg", image: "/Hero Images/aircon coursel logo/lg aircon.png" },
  { label: "Jet-Air", href: "/products?brand=jet-air", image: "/Hero Images/Featured In section/Promo sales aircons/Jet air Black mirror.png" },
  { label: "Daikin", href: "/products?brand=daikin", image: "/Hero Images/aircon coursel logo/daikin aircon.png" },
  { label: "Alliance", href: "/products?brand=alliance", image: "/Hero Images/aircon coursel logo/alliance aircon.png" },
  { label: "Comfee", href: "/products?brand=comfee", image: "/Hero Images/Product category pictures/Comfee Comfee combo front.webp" },
  { label: "Hisense", href: "/products?brand=hisense", image: "/Hero Images/aircon coursel logo/hisense aircon.png" },
  { label: "Midea", href: "/products?brand=midea", image: "/Hero Images/aircon coursel logo/midea aircon.png" },
];

const commercialAirconTypes = [
  {
    label: "Midwall Split",
    href: "/categories/commercial?type=split%20system",
    image: "/Hero Images/Product category pictures/JASA J-Smart Mid Wall font.webp",
    children: withTechnology("/categories/commercial?type=split%20system"),
  },
  {
    label: "Ceiling Cassette",
    href: "/categories/commercial?type=cassette",
    image: "/Hero Images/Product category pictures/Daikin Sky Air Cassette Inverter.webp",
    children: withTechnology("/categories/commercial?type=cassette"),
  },
  {
    label: "Ceiling Concealed",
    href: "/categories/commercial?type=ceiling%20concealed",
    image: "/Hero Images/Product category pictures/Daikin Sky Air Ceiling Concealed Inverter 1.webp",
    children: withTechnology("/categories/commercial?type=ceiling%20concealed"),
  },
  {
    label: "Under Ceiling",
    href: "/categories/commercial?type=under%20ceiling",
    image: "/Hero Images/Product category pictures/Alliance Underceiling Inverter.webp",
    children: withTechnology("/categories/commercial?type=under%20ceiling"),
  },
  {
    label: "Floor Standing",
    href: "/categories/commercial?type=floor%20standing",
    image: "/Hero Images/Product category pictures/Alliance Floor Standing Inverter.webp",
    children: withTechnology("/categories/commercial?type=floor%20standing"),
  },
  {
    label: "Ducted / Hide Away",
    href: "/categories/commercial?type=ducted",
    image: "/Hero Images/Product category pictures/Hisense LCAC Duct Type Inverter.webp",
    children: withTechnology("/categories/commercial?type=ducted"),
  },
  {
    label: "Rooftop Package",
    href: "/categories/commercial?type=package%20unit",
    image: "/Hero Images/Product category pictures/Alliance Rooftop Inverter front.webp",
    children: withTechnology("/categories/commercial?type=package%20unit"),
  },
];

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
        {
          label: "All Aircons",
          href: "/products",
          image: "/Hero Images/Product category pictures/Comfee Comfee combo front.webp",
          sections: [
            {
              label: "Shop by system type",
              id: "all-aircon-types",
              href: "/products",
              items: allAirconTypes,
            },
            {
              label: "Shop by capacity",
              id: "all-aircon-btu",
              href: "/products",
              items: allBtuOptions,
            },
            {
              label: "Shop by brand",
              id: "all-aircon-brands",
              href: "/products",
              items: brandOptions,
            },
          ],
        },
        {
          label: "Residential",
          href: "/categories/residential",
          image: "/Hero Images/Product category pictures/Alliance Black Mirror Finish Pro Inverter left.webp",
          sections: [
            {
              label: "Residential systems",
              id: "residential-aircon-types",
              href: "/categories/residential",
              items: residentialAirconTypes,
            },
            {
              label: "Shop by capacity",
              id: "residential-aircon-btu",
              href: "/categories/residential",
              items: residentialBtuOptions,
            },
          ],
        },
        {
          label: "Commercial",
          href: "/categories/commercial",
          image: "/Hero Images/Product category pictures/Alliance Cassette Inverter.webp",
          sections: [
            {
              label: "Commercial systems",
              id: "commercial-aircon-types",
              href: "/categories/commercial",
              items: commercialAirconTypes,
            },
            {
              label: "Shop by capacity",
              id: "commercial-aircon-btu",
              href: "/categories/commercial",
              items: commercialBtuOptions,
            },
          ],
        },
        {
          label: "Accessories",
          href: "/categories/accessories",
          image: "/Hero Images/Product category pictures/Installation packages 1.png",
        },
        {
          label: "Installation Packages",
          href: "/installation",
          image: "/Hero Images/feature-cards/installation nav.webp",
        },
        {
          label: "Maintenance",
          href: "/maintenance",
          image: "/Hero Images/feature-cards/Maintenece.webp",
        },
        {
          label: "Repairs",
          href: "/repairs",
          image: "/Hero Images/feature-cards/Repairs.webp",
        },
        {
          label: "Warranty",
          href: "/warranty",
          image: "/Hero Images/feature-cards/warranty-1.webp",
        },
        { label: "About Us", href: "/about", utility: true },
        { label: "Return Policy", href: "/return-policy", utility: true },
      ]}
      sideMenu={[
        [
          { label: "My Orders", href: "/account/orders", icon: History },
          { label: "My Warranties", href: "/account/warranties", icon: User },
          { label: "My Subscriptions", href: "/account/subscriptions", icon: User },
          { label: "My Profile", href: "/account/profile", icon: User },
          { label: "Sign Out", icon: LogOut, onClick: () => signOut() },
        ],
      ]}
    />
  );
}
