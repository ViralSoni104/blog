"use client";

import * as React from "react";
import { NavMain } from "@/components/admin/ui/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/ui/sidebar";
import {
  IconArticle,
  IconCategory,
  IconDashboard,
  IconMailSpark,
  IconMessage,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import Logo from "@/components/ui/logo";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <IconDashboard />,
    },
    {
      title: "Users",
      url: "/admin/user",
      icon: <IconUser />,
    },
    {
      title: "Category",
      url: "/admin/categories",
      icon: <IconCategory />,
    },
    {
      title: "Post",
      url: "/admin/posts",
      icon: <IconArticle />,
    },
    {
      title: "Comments",
      url: "/admin/comments",
      icon: <IconMessage />,
    },
    {
      title: "Subscribers",
      url: "/admin/subscribers",
      icon: <IconMailSpark />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <span className="font-extrabold">
                  <Logo className="text-2xl" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
