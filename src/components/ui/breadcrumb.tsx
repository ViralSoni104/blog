import * as React from "react";
import {
  IconHome,
  TablerIcon,
  IconChevronRight as ChevronRight,
  // IconDots as MoreHorizontal,
} from "@tabler/icons-react";
import { Slot } from "radix-ui";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/site";

interface BreadcrumbItemType {
  label: string;
  href?: string; // If no href, it renders as the current Page
  icon?: TablerIcon;
  isAdmin?: boolean;
}

interface ReusableBreadcrumbProps {
  items: BreadcrumbItemType[];
  className?: string;
  isAdmin?: boolean;
}

export function SiteBreadcrumb({
  items,
  className,
  isAdmin = false,
}: ReusableBreadcrumbProps) {
  const baseHref = isAdmin ? "/admin" : "/";
  const baseUrl = isAdmin ? `${site.url}/admin` : site.url || "/";
  const baseLabel = isAdmin ? "Dashboard" : "Home";
  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: baseLabel,
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `${site.url}${item.href}` : undefined,
      })),
    ],
  };
  const scriptProps = {
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  };

  return (
    <>
      {/* SEO Schema Injection */}
      <script type="application/ld+json" {...scriptProps} />

      <Breadcrumb className={cn("py-4", className)}>
        <BreadcrumbList>
          {/* Fixed Home Item */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={baseHref} className="flex items-center gap-2">
                <IconHome strokeWidth={1.5} className="size-4 -mt-[1px]" />
                <span className="hidden md:inline">{baseLabel}</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {items.map((item) => (
            <React.Fragment key={item.label}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      {item.icon && (
                        <item.icon strokeWidth={1.5} className="size-4" />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.icon && (
                      <item.icon strokeWidth={1.5} className="size-4" />
                    )}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

// function BreadcrumbEllipsis({
//   className,
//   ...props
// }: React.ComponentProps<"span">) {
//   return (
//     <span
//       data-slot="breadcrumb-ellipsis"
//       role="presentation"
//       aria-hidden="true"
//       className={cn("flex size-9 items-center justify-center", className)}
//       {...props}
//     >
//       <MoreHorizontal className="size-4" />
//       <span className="sr-only">More</span>
//     </span>
//   );
// }

export // Breadcrumb,
// BreadcrumbList,
// BreadcrumbItem,
// BreadcrumbLink,
// BreadcrumbPage,
// BreadcrumbSeparator,
// BreadcrumbEllipsis,
 {};
