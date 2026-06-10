"use client";

import { ShoppingCart, Search, User, Menu, HeartHandshake, HelpCircle, Heart, LogOut, History, CreditCard, Settings, FileQuestion, LifeBuoy, Bookmark, Bell, Star, MessageCircleHeart, ThumbsUp, Bug } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "./CartProvider";

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/categories/residential', label: 'Residential' },
  { href: '/categories/commercial', label: 'Commercial' },
  { href: '/categories/maintenance', label: 'Maintenance' },
  { href: '/categories/installation', label: 'Kits' },
];

const sideMenu = [
  [
    { label: "Account", href: "/account", icon: User },
    { label: "Purchase History", href: "/account/orders", icon: History },
    { label: "Payment Methods", href: "/account/payment", icon: CreditCard },
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
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

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
              className="text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            {itemCount > 0 && (
              <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-gray-500 text-[0.625rem] font-medium text-white">
                {itemCount}
              </Badge>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-auto">
              <div className="px-4">
                <SheetHeader>
                  <Link href="/" className="text-2xl font-bold text-black logo-text" onClick={() => setMobileMenuOpen(false)}>
                    Aircons Store
                  </Link>
                </SheetHeader>
                {sideMenu.map((group, index) => (
                  <div key={index} className="py-6 border-b last:border-0">
                    {group.map(({ href, label, icon: Icon }, idx) => (
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start text-left"
                        key={`side-menu-item-${idx}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={href}>
                          <Icon className="h-4 w-4 mr-2" />
                          {label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Secondary Nav */}
      <div className="h-[var(--secondary-nav-height)] bg-white border-b">
        <div className="hidden lg:flex items-center h-full px-6 gap-6">
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
          <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Menu className="h-4 w-4 mr-2" />
                Categories
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="!top-[calc(var(--primary-nav-height)+var(--secondary-nav-height))] z-40 !h-[calc(100dvh-var(--primary-nav-height)-var(--secondary-nav-height))] overflow-hidden [&>button]:hidden">
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setCategoriesOpen(false)}
                    className="block py-4 text-lg font-bold text-black border-b"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
