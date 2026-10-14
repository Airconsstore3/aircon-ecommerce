"use client";
import {
  ChevronDown,
  ChevronRight,
  History,
  LogOut,
  type LucideIcon,
  Menu,
  Search,
  ShoppingCart,
  Snowflake,
  Truck,
  Wrench,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Logo,
  LogoImage,
  LogoTextDesktop,
} from "@/components/shadcnblocks/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartProvider";

type HomeLink = {
  href: string;
  logo: {
    src: string;
    alt: string;
  };
};

type Link = {
  label: string;
  href: string;
};

interface SideMenuItem extends Omit<Link, "href"> {
  href?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

type SideMenuType = Array<SideMenuItem[]>;

type MegaMenuLink = {
  label: string;
  href: string;
  image?: string;
  children?: Link[];
};

type MegaMenuSectionType = {
  label: string;
  href: string;
  id: string;
  items: MegaMenuLink[];
};

type MenuItemType = {
  label: string;
  href?: string;
  id?: string;
  sections?: MegaMenuSectionType[];
  icon?: LucideIcon;
  image?: string;
  imageClassName?: string;
  utility?: boolean;
};

type MenuType = MenuItemType[];

interface SecondaryMenuProps {
  menu: MenuType;
  home: HomeLink;
  sideMenu: SideMenuType;
}

interface MobileMenuProps {
  menu: SideMenuType;
  navMenu: MenuType;
  homeLink: HomeLink;
}

interface NavbarProps {
  home: HomeLink;
  menu: MenuType;
  sideMenu: SideMenuType;
  className?: string;
}

const HOME = {
  href: "/",
  logo: {
    src: "",
    alt: "Aircons Store",
  },
};

const MENU = [
  {
    id: "products",
    label: "Products",
    href: "/products",
    sections: [
      {
        label: "By Type",
        id: "by-type",
        href: "/products",
        items: [
          { label: "Residential Units", href: "/categories/residential" },
          { label: "Commercial Units", href: "/categories/commercial" },
          { label: "Installation Kits", href: "/installation?kind=installation-kits" },
          { label: "Accessories", href: "/categories/accessories" },
        ],
      },
      {
        label: "By Brand",
        id: "by-brand",
        href: "/products",
        items: [
          { label: "Samsung", href: "/brands/samsung" },
          { label: "LG", href: "/brands/lg" },
          { label: "Midea", href: "/brands/midea" },
          { label: "Daikin", href: "/brands/daikin" },
          { label: "Gree", href: "/brands/gree" },
        ],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    href: "#",
    sections: [
      {
        label: "What we do",
        id: "what-we-do",
        href: "#",
        items: [
          { label: "Installation", href: "/installation" },
          { label: "Maintenance Plans", href: "/maintenance" },
          { label: "Repairs & Callouts", href: "/repairs" },
          { label: "Extended Warranty", href: "/warranty" },
        ],
      },
      {
        label: "By Property",
        id: "by-property",
        href: "#",
        items: [
          { label: "Residential", href: "/categories/residential" },
          { label: "Commercial", href: "/categories/commercial" },
        ],
      },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Sale", href: "/products?sale=true" },
];

const SIDE_MENU = [
  [
    {
      label: "My Orders",
      href: "/account/orders",
      icon: History,
    },
    {
      label: "My Warranties",
      href: "/account/warranties",
      icon: User,
    },
    {
      label: "My Subscriptions",
      href: "/account/subscriptions",
      icon: User,
    },
    {
      label: "My Profile",
      href: "/account/profile",
      icon: User,
    },
    {
      label: "Sign Out",
      href: "#",
      icon: LogOut,
    },
  ],
];

const Navbar = ({
  home = HOME,
  menu = MENU,
  sideMenu = SIDE_MENU,
  className,
}: NavbarProps) => {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const style = document.documentElement.style;
    const previousPrimary = style.getPropertyValue("--primary-nav-height");
    const previousSecondary = style.getPropertyValue("--secondary-nav-height");
    const updateHeight = () => {
      style.setProperty("--primary-nav-height", "0rem");
      style.setProperty("--secondary-nav-height", `${header.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      style.setProperty("--primary-nav-height", previousPrimary);
      style.setProperty("--secondary-nav-height", previousSecondary);
    };
  }, []);

  return (
    <header ref={headerRef} className={cn("sticky top-0 z-40 w-full bg-white font-[var(--font-google-sans-flex)] text-[#0A2540] shadow-sm", className)}>
      <SecondaryMenu menu={menu} home={home} sideMenu={sideMenu} />
    </header>
  );
};

const SearchForm = () => {
  return (
    <form action="/products#products-grid" method="get" role="search" className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#1C99D6] bg-white pl-4 transition-colors focus-within:border-[#1C99D6] focus-within:ring-2 focus-within:ring-[#1C99D6]/20 lg:h-12">
      <Search aria-hidden="true" className="hidden size-5 shrink-0 text-[#335B74] sm:block" />
      <input
        type="search"
        name="q"
        aria-label="Search products"
        placeholder="Search aircons, brands & accessories..."
        maxLength={100}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0A2540] outline-none placeholder:text-[#335B74]/75"
      />
      <button type="submit" aria-label="Search" className="m-1 flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1C99D6] text-white transition-colors hover:bg-[#0A2540] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540] lg:h-10 lg:w-12">
        <Search aria-hidden="true" className="size-5" />
      </button>
    </form>
  );
};

const MobileMenu = ({ menu, navMenu }: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Open menu"
          className="text-[#0A2540] hover:bg-[#1C99D6]/10 hover:text-[#0A2540] focus:bg-[#1C99D6]/10 focus:text-[#0A2540] data-[state=open]:bg-[#1C99D6]/10 data-[state=open]:text-[#0A2540] [&_svg]:size-6"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="mobile-drawer hide-scrollbar w-[85vw] gap-0 overflow-y-auto overscroll-contain border-none bg-[#16324F] p-0 text-white sm:max-w-sm"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "calc(32px + env(safe-area-inset-bottom))",
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        {/* Drawer header — logo + thin divider */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <span className="font-[var(--font-google-sans-flex)] text-[15px] font-semibold uppercase tracking-[0.15em] text-white/90">
            Aircons Store
          </span>
          {/* Close button — 24px icon, top right, rotation animation */}
          <SheetClose asChild>
            <button
              aria-label="Close menu"
              className="mobile-drawer-close flex size-10 items-center justify-center text-white/70 transition-all duration-200 hover:text-white active:scale-95"
            >
              <svg className="size-6 transition-transform duration-300 ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </SheetClose>
        </div>
        <div className="h-px w-full bg-white/10" />

        {/* Navigation items — 60px height, 20px font, 600 weight, white.
            1px dividers at rgba(255,255,255,.10). Touch feedback on tap.
            Active state: 3px brand blue bar on the left. */}
        <nav aria-label="Mobile navigation" className="flex shrink-0 flex-col">
          {navMenu.map((item, index) => {
            const hasMenu = Boolean(item.sections?.length);
            const itemClass = "mobile-nav-item group relative flex min-h-[60px] items-center px-6 font-[var(--font-google-sans-flex)] text-[20px] font-semibold leading-none tracking-[0.01em] text-white transition-colors duration-200 hover:bg-white/5 active:bg-white/5";

            if (hasMenu) {
              return (
                <details key={`mobile-nav-${index}`} className="group/mobile">
                  <summary className={cn(itemClass, "list-none cursor-pointer [&::-webkit-details-marker]:hidden")} aria-current={pathname === item.href ? "page" : undefined}>
                    <span className="absolute left-0 top-1/2 h-6 w-0 -translate-y-1/2 bg-[#1C99D6] transition-all duration-300 ease-out group-hover:w-[3px]" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight aria-hidden="true" className="size-5 text-white/60 transition-transform duration-200 group-open/mobile:rotate-90" />
                    <span className="absolute bottom-0 left-6 right-6 h-px bg-white/10" />
                  </summary>
                  <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                    <a href={item.href} className="mb-2 flex h-11 items-center rounded-lg px-2 text-sm font-semibold text-[#7DD3FC]">
                      View all {item.label}
                    </a>
                    {item.sections?.map((section) => (
                      <div key={section.id} className="space-y-1 pt-2">
                        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{section.label}</p>
                        {section.items.map((subItem) =>
                          subItem.children ? (
                            <details key={subItem.label} className="group/nested rounded-lg">
                              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-2 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white [&::-webkit-details-marker]:hidden">
                                {subItem.image && (
                                  <span className="relative size-8 shrink-0 overflow-hidden rounded bg-white/90">
                                    <Image src={subItem.image} alt="" fill sizes="32px" className="object-contain" />
                                  </span>
                                )}
                                <span className="flex-1">{subItem.label}</span>
                                <ChevronRight aria-hidden="true" className="size-4 text-white/50 transition-transform group-open/nested:rotate-90" />
                              </summary>
                              <div className="ml-11 border-l border-white/10 pl-3 pb-1">
                                <a href={subItem.href} className="block py-2 text-sm text-[#7DD3FC]">All {subItem.label}</a>
                                {subItem.children.map((child) => (
                                  <a key={child.label} href={child.href} className="block py-2 text-sm text-white/70 hover:text-white">{child.label}</a>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <a key={subItem.label} href={subItem.href} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white">
                              {subItem.image && (
                                <span className="relative size-8 shrink-0 overflow-hidden rounded bg-white/90">
                                  <Image src={subItem.image} alt="" fill sizes="32px" className="object-contain" />
                                </span>
                              )}
                              {subItem.label}
                            </a>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              );
            }

            return (
              <a
                key={`mobile-nav-${index}`}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={itemClass}
              >
                {/* Active indicator — 3px brand blue bar, 24px tall, left edge */}
                <span className="absolute left-0 top-1/2 h-6 w-0 -translate-y-1/2 bg-[#1C99D6] transition-all duration-300 ease-out group-hover:w-[3px]" />
                {item.label}
                {/* Divider — only between items, not above first or below last */}
                {index < navMenu.length - 1 && (
                  <span className="absolute bottom-0 left-6 right-6 h-px bg-white/10" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Account section — separated by 40px gap from navigation.
            Smaller font (18px), weight 500. */}
        <div className="mt-10">
          <div className="h-px w-full bg-white/10" />
          {menu.map((group, groupIndex) => (
            <div key={`side-group-${groupIndex}`}>
              {group.map(({ href, label, icon: Icon, onClick }, index) => {
                const itemClass =
                  "mobile-nav-item group relative flex h-[52px] w-full items-center gap-3 px-6 text-left font-[var(--font-google-sans-flex)] text-[18px] font-medium leading-none tracking-[0.01em] text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white active:bg-white/5";
                const contents = (
                  <>
                    {/* Active indicator */}
                    <span className="absolute left-0 top-1/2 h-6 w-0 -translate-y-1/2 bg-[#1C99D6] transition-all duration-300 ease-out group-hover:w-[3px]" />
                    {Icon && <Icon className="size-4 text-white/50" strokeWidth={1.5} />}
                    {label}
                    {/* Divider */}
                    {index < group.length - 1 && (
                      <span className="absolute bottom-0 left-6 right-6 h-px bg-white/10" />
                    )}
                  </>
                );
                return onClick ? (
                  <button
                    type="button"
                    onClick={onClick}
                    className={itemClass}
                    key={`side-menu-item-${index}`}
                  >
                    {contents}
                  </button>
                ) : (
                  <a
                    href={href}
                    className={itemClass}
                    key={`side-menu-item-${index}`}
                  >
                    {contents}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const SecondaryMenu = ({ menu, home, sideMenu }: SecondaryMenuProps) => {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const categoryMenu = menu.filter((item) => !item.utility);
  const utilityMenu = menu.filter((item) => item.utility);
  // Tracks which hover/focus mega-menu is open so aria-expanded can be
  // reported accurately. escapeClosed suppresses the CSS focus-within
  // open state after Escape so the menu truly closes.
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [escapeClosed, setEscapeClosed] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Route changes close any open menu — adjusting state during render
  // (not in an effect) so no extra render pass is scheduled.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenSubmenu(null);
    setEscapeClosed(null);
  }

  return (
    <>
      <div className="top-bar text-white">
        <div className="mx-auto flex min-h-11 max-w-[1440px] items-center justify-center gap-6 px-4 text-[13px] font-medium sm:px-6 lg:justify-between lg:px-8">
          <div className="flex items-center gap-5 text-white/95">
            <span className="flex items-center gap-2"><Truck aria-hidden="true" className="size-[17px] text-white" />Free delivery in Cape Town</span>
            <span className="hidden items-center gap-2 border-l border-white/25 pl-5 sm:flex"><Wrench aria-hidden="true" className="size-[17px] text-white" />Installation & aftercare</span>
            <span className="hidden items-center gap-2 border-l border-white/25 pl-5 xl:flex"><Snowflake aria-hidden="true" className="size-[17px] text-white" />Comfort for every season</span>
          </div>
          <nav aria-label="Store information" className="hidden items-center gap-5 lg:flex">
            {utilityMenu.map(({ href, label }) => (
              <a key={label} href={href} className="text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{label}</a>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 pb-3 sm:px-6 lg:min-h-[88px] lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:gap-x-10 lg:px-8 lg:py-2">
        <Logo url={home.href} className="h-16 min-w-0 lg:h-[72px]">
          {home.logo.src ? (
            <LogoImage src={home.logo.src} alt={home.logo.alt} className="w-[190px] max-w-full object-contain sm:w-[220px] lg:w-[240px]" />
          ) : (
            <LogoTextDesktop className="logo-text text-xl font-semibold">Aircons Store</LogoTextDesktop>
          )}
        </Logo>
        <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <SearchForm />
        </div>
        <div className="col-start-2 row-start-1 flex items-center gap-0.5 sm:gap-3 lg:col-start-3 lg:gap-5">
          <a href="/login" aria-label="Log in to your account" className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg transition-colors hover:bg-[#F0F9FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6] lg:px-2">
            <User aria-hidden="true" className="size-5" strokeWidth={1.7} />
            <span className="hidden text-left leading-tight lg:block"><span className="block text-[11px] text-[#335B74]">Welcome back</span><span className="text-sm font-semibold">Log in / Register</span></span>
          </a>
          <span aria-hidden="true" className="hidden h-8 w-px bg-[#0A2540]/10 lg:block" />
          <a href="/cart" aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} className="flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-lg transition-colors hover:bg-[#F0F9FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6] lg:px-2">
            <span className="relative">
              <ShoppingCart aria-hidden="true" className="size-5 lg:size-6" strokeWidth={1.7} />
              <span aria-hidden="true" className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1C99D6] px-1 text-[10px] font-semibold text-white">{itemCount}</span>
            </span>
            <span className="hidden text-sm font-semibold sm:block">Cart</span>
          </a>
          <div className="lg:hidden"><MobileMenu menu={sideMenu} navMenu={menu} homeLink={home} /></div>
        </div>
      </div>
      <div className="border-b border-[#B8E3F7]/70 bg-white">
        <nav aria-label="Shop categories and services" className="mx-auto max-w-[1440px] overflow-x-auto px-4 sm:px-6 lg:overflow-visible lg:px-8">
          <ul className="flex min-w-max items-stretch gap-1 lg:min-w-0 lg:gap-2">
            {categoryMenu.map(({ href, label, image, imageClassName, icon: Icon = Snowflake, sections }, index) => {
              const active = pathname === href;
              const hasMenu = Boolean(sections?.length);
              const submenuId = `nav-submenu-${index}`;
              const submenuOpen = hasMenu && openSubmenu === label && escapeClosed !== label;
              return (
                <li
                  key={label}
                  className="group relative shrink-0 lg:min-w-0 lg:flex-1"
                  onMouseEnter={() => {
                    if (!hasMenu) return;
                    setOpenSubmenu(label);
                    setEscapeClosed(null);
                  }}
                  onMouseLeave={() => hasMenu && setOpenSubmenu(null)}
                  onFocus={() => {
                    if (!hasMenu) return;
                    setOpenSubmenu(label);
                    setEscapeClosed(null);
                  }}
                  onBlur={(event) => {
                    if (
                      hasMenu &&
                      !(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
                    ) {
                      setOpenSubmenu(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && submenuOpen) {
                      event.stopPropagation();
                      setOpenSubmenu(null);
                      setEscapeClosed(label);
                      event.currentTarget.querySelector("a")?.focus();
                    }
                  }}
                >
                  <a href={href} aria-current={active ? "page" : undefined} aria-haspopup={hasMenu ? "menu" : undefined} aria-expanded={hasMenu ? submenuOpen : undefined} aria-controls={hasMenu ? submenuId : undefined} className={cn(
                    "group/link flex min-w-[104px] flex-col items-center justify-center gap-2 border-b-2 px-2 pb-2.5 pt-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1C99D6] lg:min-w-0 lg:pb-3 xl:text-[13px]",
                    active ? "border-[#1C99D6] text-[#0A2540]" : "border-transparent text-[#0A2540]",
                  )}>
                    <span className="relative block h-[68px] w-[112px] overflow-hidden rounded-md transition-transform motion-safe:group-hover/link:-translate-y-0.5 lg:h-[78px] lg:w-[128px]">
                      {image ? (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 256px, 224px"
                          quality={90}
                          loading="eager"
                          className={cn("object-contain", imageClassName)}
                        />
                      ) : (
                        <Icon aria-hidden="true" strokeWidth={1.5} className="mx-auto h-full w-8 text-[#1C99D6]" />
                      )}
                    </span>
                    <span className={cn(index === 0 && "font-semibold text-[#1478A8]", "inline-flex items-center gap-1 uppercase tracking-wide group-hover/link:text-[#1478A8]")}>
                      {label}
                      {hasMenu && <ChevronDown aria-hidden="true" className="size-3 transition-transform duration-200 group-hover:rotate-180" />}
                    </span>
                  </a>

                  {hasMenu && (
                    <div id={submenuId} role="menu" aria-label={label} className={cn(
                      "invisible pointer-events-none absolute left-0 top-full z-50 w-max max-w-[calc(100vw-2rem)] translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                      escapeClosed === label && "hidden"
                    )}>
                      <div className="flex rounded-xl border border-[#DCEFF8] bg-[#F7FAFC] shadow-[0_14px_35px_rgba(10,37,64,0.16)]">
                        {sections?.map((section, sectionIndex) => (
                          <div key={section.id} className={cn("w-[280px] p-1.5", sectionIndex > 0 && "border-l border-[#E5EEF5]")}>
                            <div className="flex items-center justify-between px-3 pb-1 pt-2">
                              <a href={section.href} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#335B74] transition-colors hover:text-[#1C99D6]">{section.label}</a>
                              <a href={href} className="text-[10px] font-medium text-[#1478A8] hover:underline">View all</a>
                            </div>
                            <ul className="divide-y divide-[#E5EEF5]">
                              {section.items.map((item) => (
                                <li key={item.label} className="group/item relative">
                                  <a href={item.href} className="flex min-h-12 items-center gap-3 px-2 py-1.5 text-[15px] font-medium text-[#5F6B7A] transition-colors hover:bg-white hover:text-[#0A2540] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1C99D6]">
                                    {item.image && (
                                      <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-white">
                                        <Image src={item.image} alt="" fill sizes="36px" className="object-contain" />
                                      </span>
                                    )}
                                    <span className="flex-1">{item.label}</span>
                                    {item.children && <ChevronRight aria-hidden="true" className="size-4 text-[#9AA8B4]" />}
                                  </a>
                                  {item.children && (
                                    <div className="invisible pointer-events-none absolute left-[calc(100%-1px)] top-0 z-10 w-48 translate-x-2 opacity-0 transition-all duration-200 group-hover/item:pointer-events-auto group-hover/item:visible group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-within/item:pointer-events-auto group-focus-within/item:visible group-focus-within/item:translate-x-0 group-focus-within/item:opacity-100">
                                      <div className="rounded-xl border border-[#DCEFF8] bg-[#F7FAFC] p-1.5 shadow-[0_14px_35px_rgba(10,37,64,0.16)]">
                                        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#335B74]">Technology</p>
                                        {item.children.map((child) => (
                                          <a key={child.label} href={child.href} className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-[#5F6B7A] transition-colors hover:bg-white hover:text-[#0A2540] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1C99D6]">{child.label}</a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export { Navbar };
