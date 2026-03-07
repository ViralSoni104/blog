// components/Navbar.jsx
import { useState } from "react";
import ToggleTheme from "@/components/theme/toggle-theme";
import { Button } from "@/components/ui/button";
import { SearchMenu } from "@/components/search/search-menu";
import {
  Navbar as Nav,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import UserMenu from "@/components/auth/ui/user-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { navItems } from "@/lib/constants";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useCurrentUser();
  return (
    <Nav>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center justify-center gap-1">
          <ToggleTheme />
          <span className="text-foreground/20 mr-2">|</span>
          <div className="flex items-center justify-center gap-1">
            <SearchMenu />
            <span className="text-foreground/20 mx-2">|</span>
            {user && <UserMenu user={user} />}
            {!user && (
              <div className="flex gap-2 text-xs">
                <Link href="/auth/signup">
                  <Button
                    variant="secondary"
                    className="hover:bg-sidebar-ring/30 cursor-pointer"
                  >
                    Sign up
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="bg-primary text-background hover:text-background hover:bg-chart-2 dark:bg-chart-1 cursor-pointer"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            user={user}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <ToggleTheme />
          {navItems.map((item) => (
            <a
              key={`mobile-link-${item.name}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground text-md relative font-medium tracking-tight"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}
          {!user && (
            <>
              <span className="bg-foreground/10 h-[2px] w-full"></span>
              <div className="flex flex-col gap-6">
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="text-md hover:bg-sidebar-ring/30 cursor-pointer font-medium"
                  >
                    Sign up
                  </Button>
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-md bg-primary text-background hover:text-background cursor-pointer font-medium"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </>
          )}
        </MobileNavMenu>
      </MobileNav>
    </Nav>
  );
}
