import { SidebarTrigger } from "@/components/admin/ui/sidebar";
import { NavUser } from "@/components/admin/ui/nav-user";
import { Separator } from "@/components/ui/separator";
import ToggleTheme from "@/components/theme/toggle-theme";

export function SiteHeader() {
  return (
    <header className="flex w-full h-(--header-height) shrink-0 items-center gap-2 border-b border-muted-foreground/30 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between">
        <div className="flex h-full flex-row items-center gap-1 ml-3">
          <SidebarTrigger />
        </div>
        <div className="flex flex-row items-center gap-2 md:mr-3">
          <ToggleTheme />
          <Separator orientation="vertical" />
          <NavUser />
        </div>
      </div>
    </header>
  );
}
