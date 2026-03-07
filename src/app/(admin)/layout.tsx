import { Toaster } from "sonner";
import { AppSidebar } from "@/components/admin/ui/app-sidebar";
import { SiteHeader } from "@/components/admin/ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Toaster closeButton richColors />
      <TooltipProvider>
        <AppSidebar variant="inset" />
      </TooltipProvider>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
