"use client";
import Link from "next/link";
import { socialLinks } from "@/lib/constants";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/logo";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    // 💡 FIX: Wrap in a setTimeout!
    // This pushes the state update to the next event tick, bypassing the React 19 warning
    // and completely hiding new Date() from Next.js SSR.
    const timer = setTimeout(() => {
      setCurrentYear(new Date().getFullYear());
    }, 0);

    // Cleanup the timer just in case the component unmounts instantly
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="w-full bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Logic: 
          - Mobile: 1 column for brand, then a 2-column grid for Nav & Connect.
          - Desktop: Standard 4-column layout.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* 1. Brand & Philosophy - Takes full width on mobile (2 cols) */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link href="/">
              <Logo className="text-4xl mb-2" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Refactoring the human experience through technical insights and
              narrative wisdom.
            </p>
          </div>

          {/* 2. Navigation - Half width on mobile (1 col) */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/articles"
                className="hover:text-primary transition-colors w-fit"
              >
                Articles
              </Link>
              <Link
                href="/category"
                className="hover:text-primary transition-colors w-fit"
              >
                Category
              </Link>
              <Link
                href="/about"
                className="hover:text-primary transition-colors w-fit"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors w-fit"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* 3. Connect - Half width on mobile (1 col) */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Connect
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="group flex items-center gap-1 hover:text-primary transition-colors w-fit"
                >
                  {item.name}
                  <IconArrowUpRight
                    size={14}
                    className="opacity-0 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* 4. Bottom Metadata */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-muted-foreground/30 border-dashed">
          <p className="text-[13px] text-muted-foreground">
            © {currentYear} VR Soni. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/disclaimer"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
