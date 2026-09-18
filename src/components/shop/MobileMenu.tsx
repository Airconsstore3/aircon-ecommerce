"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
}

interface SideMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

type SideMenuType = SideMenuItem[][];

interface MobileMenuProps {
  sideMenu: SideMenuType;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface MobileCategoriesDropdownProps {
  navLinks: NavLink[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function MobileMenu({ sideMenu, open, setOpen }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-hidden">
        <div className="px-4">
          <SheetHeader>
            <Link
              href="/"
              className="text-2xl font-bold text-black logo-text"
              onClick={() => setOpen(false)}
            >
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
                  onClick={() => setOpen(false)}
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
  );
}

export function MobileCategoriesDropdown({
  navLinks,
  open,
  setOpen,
}: MobileCategoriesDropdownProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <Menu className="h-4 w-4 mr-2" />
          Categories
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="!top-[calc(var(--primary-nav-height)+var(--secondary-nav-height))] z-40 !h-[calc(100dvh-var(--primary-nav-height)-var(--secondary-nav-height))] overflow-hidden [&>button]:hidden"
      >
        <div className="min-h-0 flex-1 overflow-hidden p-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-4 text-lg font-bold text-black border-b"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
