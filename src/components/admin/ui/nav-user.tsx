"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getInitials } from "@/lib/utils";
import { IconDotsVertical, IconHome, IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export function NavUser() {
  const cuser = useCurrentUser();
  if (!cuser) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full grayscale">
                <AvatarImage
                  src={cuser.image}
                  alt={cuser.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-full">
                  {getInitials(cuser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{cuser.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {cuser.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-auto rounded-lg p-2"
            side={"bottom"}
            align="end"
            sideOffset={4}
            alignOffset={10}
          >
            <DropdownMenuItem
              className=""
              onClick={() => {
                redirect("/");
              }}
            >
              <IconHome />
              Go to Home
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="bg-red-500 text-white p-2 mt-2"
              onClick={() => {
                signOut();
              }}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
