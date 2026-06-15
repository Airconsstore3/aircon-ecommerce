"use client";
import {
  ChevronDown,
  History,
  LayoutGrid,
  LogOut,
  type LucideIcon,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import {
  type CSSProperties,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Logo,
  LogoImage,
  LogoTextDesktop,
} from "@/components/shadcnblocks/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
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

interface SideMenuItem extends Link {
  icon: LucideIcon;
}

type HelpfullLinkGroup = {
  group: string;
  links: Link[];
};

type SideMenuType = Array<SideMenuItem[]>;

type MegaMenuSectionType = {
  label: string;
  href: string;
  id: string;
  items: {
    label: string;
    href: string;
  }[];
};

type MenuItemType = {
  label: string;
  href?: string;
  id?: string;
  sections?: MegaMenuSectionType[];
};

type MenuType = MenuItemType[];

interface SecondaryMenuProps {
  menu: MenuType;
  home: HomeLink;
  sideMenu: SideMenuType;
}

interface SecondaryMenuMobileProps {
  menu: MenuType;
  home: HomeLink;
}

type DesktopMenuDropdownItemProps = MenuItemType;

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
          { label: "Installation Kits", href: "/categories/kits" },
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
          { label: "Extended Warranty", href: "/categories/warranty" },
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
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-nav-height", "0rem");
    document.documentElement.style.setProperty(
      "--secondary-nav-height",
      "6rem",
    );
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50", className)}>
      <div className="h-[var(--secondary-nav-height)]">
        <SecondaryMenu menu={menu} home={home} sideMenu={sideMenu} />
      </div>
    </header>
  );
};

const SearchForm = () => {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-11 hover:bg-accent-foreground/10 [&_svg]:size-5"
    >
      <Search />
    </Button>
  );
};

const MobileMenu = ({ menu, navMenu }: MobileMenuProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-[#0A2540] hover:bg-[#1C99D6]/10 hover:text-[#0A2540] focus:bg-[#1C99D6]/10 focus:text-[#0A2540] data-[state=open]:bg-[#1C99D6]/10 data-[state=open]:text-[#0A2540] [&_svg]:size-6"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="hide-scrollbar w-full overflow-auto border-none bg-[#0A2540]/95 p-0 text-white backdrop-blur-md sm:max-w-full">
        <div className="px-3 py-4">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
          </SheetHeader>
          <div className="mb-6 flex items-center gap-3 border border-white px-3 py-3">
            <input
              aria-label="Search"
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/70"
            />
            <Search className="size-5" />
          </div>
          <div>
            {navMenu.map(({ href, label }, index) => (
              <a
                key={`mobile-nav-${index}`}
                href={href}
                className="block border-b border-white/20 py-4 font-[var(--font-google-sans-flex)] text-sm font-medium uppercase tracking-wider text-white first:border-t"
              >
                {label}
              </a>
            ))}
          </div>
          {menu.map((group, index) => (
            <div key={index}>
              {group.map(({ href, label }, index) => (
                <a
                  href={href}
                  className="block border-b border-white/20 py-4 font-[var(--font-google-sans-flex)] text-sm font-medium uppercase tracking-wider text-white"
                  key={`side-menu-item-${index}`}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const SecondaryMenu = ({ menu, home, sideMenu }: SecondaryMenuProps) => {
  const isMobile = useIsMobile();
  const { itemCount } = useCart();

  return (
    <div className="border-b border-[#1C99D6]/15 bg-white/95 px-4 py-1 shadow-sm backdrop-blur-sm md:px-6">
      <div className="relative flex h-full flex-col items-center justify-center gap-0 md:justify-start md:gap-1">
        <Logo url={home.href} className="min-w-0 shrink-0">
          {home.logo.src && (
            <LogoImage
              src={home.logo.src}
              alt={home.logo.alt}
              className="h-[4.5rem] max-w-[78vw] object-contain md:h-24 md:max-w-none"
            />
          )}
          {!home.logo.src && (
            <LogoTextDesktop className="font-medium text-primary-foreground logo-text">
              Aircons Store
            </LogoTextDesktop>
          )}
        </Logo>
        <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 items-center gap-2 lg:flex">
          <SearchForm />
          <Button
            size="icon"
            variant="ghost"
            className="size-11 hover:bg-accent-foreground/10 [&_svg]:size-5"
            asChild
          >
            <a href="/login" aria-label="Sign In">
              <User />
            </a>
          </Button>
          <div className="relative size-fit">
            <Button
              size="icon"
              variant="ghost"
              className="size-11 hover:bg-accent-foreground/10 [&_svg]:size-5"
              asChild
            >
              <a href="/cart" aria-label="Cart">
                <ShoppingCart />
              </a>
            </Button>
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1C99D6] px-1 text-[0.625rem] font-medium text-white">
                {itemCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="hidden w-full justify-center overflow-x-auto lg:flex">
          <NavigationMenu
            className="[&_a]:bg-transparent [&_a]:hover:bg-accent-foreground/10 [&_button]:bg-transparent [&_button]:hover:bg-accent-foreground/10"
            viewport={isMobile}
          >
            <NavigationMenuList className="flex-nowrap gap-1 xl:gap-2">
              {menu.map(({ sections, ...item }, index) => (
                <NavigationMenuItem value={`${index}`} key={index}>
                  {sections ? (
                    <DesktopMenuDropdownItem sections={sections} {...item} />
                  ) : (
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-auto rounded-none border border-transparent bg-transparent px-2.5 py-1 font-[var(--font-google-sans-flex)] text-[10px] font-medium uppercase tracking-wider text-[#0A2540] transition-colors hover:border-[#2599d4] hover:bg-[#2599d4]/10 hover:text-[#2599d4] xl:text-xs",
                      )}
                    >
                      <a href={item.href}>{item.label}</a>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-1 md:absolute md:top-1/2 md:right-0 md:w-auto md:-translate-y-1/2 md:gap-2 lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-[#0A2540] hover:bg-[#1C99D6]/10 [&_svg]:size-4"
          >
            <Search />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-[#0A2540] hover:bg-[#1C99D6]/10 [&_svg]:size-4"
            asChild
          >
            <a href="/login" aria-label="Log In">
              <User />
            </a>
          </Button>
          <Button variant="ghost" className="px-2 font-[var(--font-google-sans-flex)] text-xs font-medium uppercase tracking-wider text-[#0A2540] hover:bg-[#1C99D6]/10 sm:text-sm" asChild>
            <a href="/cart">Cart {itemCount > 0 ? `(${itemCount})` : ""}</a>
          </Button>
          <MobileMenu menu={sideMenu} navMenu={menu} homeLink={home} />
        </div>
      </div>
    </div>
  );
};

const SecondaryMenuMobile = ({ menu, home }: SecondaryMenuMobileProps) => {
  if (!menu) return;

  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <LayoutGrid />
          Categories
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="!top-[calc(var(--primary-nav-height)+var(--secondary-nav-height))] z-40 !h-[calc(100dvh-var(--primary-nav-height)-var(--secondary-nav-height))] overflow-hidden [&>button]:hidden"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Categories</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-10">
          <div className="p-6">
            {menu.map(({ sections, label, href }, index) => (
              <div key={index}>
                <h2 className="border-b py-4 text-lg leading-normal font-normal">
                  {href ? <a href={href}>{label}</a> : <span>{label}</span>}
                </h2>
                {sections && (
                  <Accordion type="multiple">
                    {sections.map(({ id, label, items }) => (
                      <AccordionItem value={id} key={`menu-section-${id}`}>
                        <AccordionTrigger>{label}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col">
                            {items.map(({ href, label }, index) => (
                              <Button
                                className="w-full justify-start"
                                asChild
                                variant="ghost"
                                size="sm"
                                key={`menu-item-${index}`}
                              >
                                <a href={href}>{label}</a>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const DesktopMenuDropdownItem = ({
  sections,
  label,
  href,
}: DesktopMenuDropdownItemProps) => {
  const [activeSectionId, setActiveSectionId] = useState<string>();

  const sharedClasses = "h-full space-y-2 overflow-auto pt-6 pb-2";

  const MenuItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedSectionId =
      e.currentTarget.getAttribute("data-id") ?? undefined;

    setActiveSectionId(selectedSectionId);
  };

  const MenuItemMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedSectionId =
      e.currentTarget.getAttribute("data-id") ?? undefined;

    setActiveSectionId(selectedSectionId);
  };

  const activeSectionData = useMemo(
    () => sections?.find((section) => section.id === activeSectionId),
    [sections, activeSectionId],
  );

  if (!sections) return;

  return (
    <Fragment>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent className="p-0 bg-white">
        <div
          style={
            {
              "--menu-margin-bottom": "5rem",
            } as CSSProperties
          }
          className="flex max-h-[calc(100dvh-var(--secondary-nav-height)-var(--primary-nav-height)-var(--menu-margin-bottom))] max-w-110"
        >
          <div>
            <div className={cn("w-60", sharedClasses)}>
              <h2 className="px-6 text-sm font-normal">
                <a href={href}>{label}</a>
              </h2>
              <ol>
                {sections.map((section, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      data-id={section.id}
                      data-state={
                        section.id === activeSectionId ? "active" : "inactive"
                      }
                      onClick={MenuItemClick}
                      onMouseEnter={MenuItemMouseEnter}
                      className={cn(
                        "relative w-full justify-start rounded-none px-6 text-left font-normal",
                        "data-[state=active]:bg-accent",
                        "transition-opacity after:absolute after:inset-y-0 after:left-0 after:h-full after:w-1 after:bg-primary data-[state=inactive]:after:opacity-0",
                      )}
                    >
                      {section.label}
                    </Button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          {activeSectionData && (
            <div>
              <div className={cn("w-50 bg-accent", sharedClasses)}>
                <h2 className="px-6 text-sm font-normal">
                  {activeSectionData.label}
                </h2>
                <ol>
                  {activeSectionData.items.map((item, index) => (
                    <li key={index}>
                      <NavigationMenuLink
                        className="px-6 hover:underline"
                        asChild
                      >
                        <a href={item.href}>{item.label}</a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </NavigationMenuContent>
    </Fragment>
  );
};

export { Navbar };
