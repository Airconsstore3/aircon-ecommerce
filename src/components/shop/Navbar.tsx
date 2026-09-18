"use client";

import { ShoppingCart, Search, User, HeartHandshake, HelpCircle, Heart, LogOut, History, Settings, FileQuestion, LifeBuoy, Bookmark, Bell, Star, MessageCircleHeart, ThumbsUp, Bug } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartProvider";
import { Badge } from "@/components/ui/badge";
import { MobileMenu, MobileCategoriesDropdown } from "./MobileMenu";

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/categories/residential', label: 'Residential' },
  { href: '/categories/commercial', label: 'Commercial' },
  { href: '/categories/maintenance', label: 'Maintenance' },
  { href: '/categories/installation', label: 'Installation' },
];

const sideMenu = [
  [
    { label: "Account", href: "/account", icon: User },
    { label: "Purchase History", href: "/account/orders", icon: History },
    { label: "Account Settings", href: "/account/settings", icon: Settings },
    { label: "Sign Out", href: "/auth/logout", icon: LogOut },
  ],
  [
    { label: "Help", href: "/help", icon: HeartHandshake },
    { label: "Help Center", href: "/help/center", icon: HelpCircle },
    { label: "FAQs", href: "/help/faq", icon: FileQuestion },
    { label: "Support Tickets", href: "/help/tickets", icon: LifeBuoy },
  ],
  [
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Saved Items", href: "/account/saved", icon: Bookmark },
    { label: "Back in Stock Alerts", href: "/account/alerts", icon: Bell },
    { label: "Recently Viewed", href: "/account/recent", icon: Star },
  ],
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { itemCount, setIsOpen } = useCart();

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-nav-height", "4rem");
    document.documentElement.style.setProperty("--secondary-nav-height", "3rem");
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Primary Nav */}
      <div className="flex h-[var(--primary-nav-height)] items-center gap-3 bg-black px-6 py-4 text-white">
        {/* Logo */}
        <Link href="/" className="shrink-0 p-2">
          <span className="text-2xl font-bold text-white logo-text font-[var(--font-poppins)]">Aircons Store</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {/* Desktop Icons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/help">
                <HeartHandshake className="h-4 w-4 mr-2" />
                Help
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/account/wishlist">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/account">
                <User className="h-4 w-4 mr-2" />
                Account
              </Link>
            </Button>
          </div>

          {/* Search */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <div className="relative size-fit">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1C99D6] px-1 text-[0.625rem] font-medium text-white">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            sideMenu={sideMenu}
            open={mobileMenuOpen}
            setOpen={setMobileMenuOpen}
          />
        </div>
      </div>

      {/* Secondary Nav */}
      <div className="h-[var(--secondary-nav-height)] bg-white border-b">
        <div className="hidden lg:flex items-center h-full px-6 gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="lg:hidden flex items-center h-full px-6">
          <MobileCategoriesDropdown
            navLinks={navLinks}
            open={categoriesOpen}
            setOpen={setCategoriesOpen}
          />
        </div>
      </div>
    </header>
  );
}
