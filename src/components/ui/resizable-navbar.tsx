"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { m, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { SearchMenu } from "@/components/search/search-menu";
import Link from "next/link";
import { ExtendedUser } from "@/next-auth";
import UserMenu from "../auth/ui/user-menu";
import Logo from "@/components/ui/logo";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

// 💡 1. The Wrapper: Now perfectly matches ContainerMain widths and borders
export const Navbar = ({ children, className }: NavbarProps) => {
  return (
    <header
      className={cn(
        "fixed right-0 left-0 top-0 z-50 mx-auto w-full transition-all duration-300",
        "bg-background", // Solid background (no glass effect)
        "max-w-[100vw] lg:max-w-[75vw]", // Matches your ContainerMain precisely
        "border-b-1 md:border-x-1 border-dashed border-foreground/20", // The brutalist bottom and side borders
        className,
      )}
    >
      <div className="mx-auto w-full">{children}</div>
    </header>
  );
};

// 💡 2. Desktop Body: Removed Framer Motion layout changes, just standard flexbox now
export const NavBody = ({ children, className }: NavBodyProps) => {
  return (
    <div
      className={cn(
        "mx-auto hidden flex-row items-center justify-between py-3 lg:flex",
        "w-full px-4 lg:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

// 💡 3. Nav Items: Hover effects kept perfectly intact!
export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <m.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden flex-1 flex-row items-center justify-start transition-all font-medium duration-200 lg:flex",
        "lg:space-x-0.5 xl:space-x-1 2xl:space-x-2",
        "lg:text-[13px] xl:text-sm",
        className,
      )}
    >
      <span className="text-foreground/20 mx-1">|</span>
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className={cn(
            "text-foreground relative py-2 transition-all",
            "lg:px-1 xl:px-2",
          )}
          key={`link-${item.name}`}
          href={item.link}
        >
          {hovered === idx && (
            <m.div
              layoutId="hovered"
              className="bg-muted absolute inset-0 h-full w-full rounded"
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            />
          )}
          <span className={cn("relative z-20", idx === 1 ? "ml-1" : "ml-1")}>
            {item.name}
          </span>
        </a>
      ))}
    </m.div>
  );
};

// 💡 4. Mobile Nav Wrapper: Removed its own bottom border since the parent <Navbar> now has it
export const MobileNav = ({ children, className }: MobileNavProps) => {
  return (
    <div
      className={cn(
        "z-50 mx-auto flex w-full flex-col justify-between py-3 px-4 lg:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "z-[100] mx-auto flex w-full flex-1 flex-row items-center justify-between px-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-background/98 fixed inset-0 z-[40] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden backdrop-blur-xl",
            className,
          )}
        >
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            {children}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  user,
}: {
  isOpen: boolean;
  onClick: () => void;
  user: ExtendedUser | null;
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-1 rounded-xl p-1 bg-muted">
      <SearchMenu />
      {user && <UserMenu user={user} />}
      <span className="text-foreground/20">|</span>
      <div className="rounded-md bg-secondary h-8 w-9 flex justify-center items-center hover:bg-secondary/40">
        {isOpen ? (
          <IconX
            className="text-foreground dark:text-foreground size-6 cursor-pointer"
            onClick={onClick}
          />
        ) : (
          <IconMenu2
            className="text-foreground dark:text-foreground size-6 cursor-pointer"
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="text-foreground relative z-20 mr-2 py-1 font-normal lg:py-2 lg:pl-2"
    >
      <Logo className="text-2xl md:text-xl" />
    </Link>
  );
};
