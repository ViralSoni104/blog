import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { ExtendedUser } from "@/next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  IconBookmark,
  IconDashboard,
  IconLogout2,
  IconSettings,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu({ user }: { user: ExtendedUser }) {
  function logOut() {
    signOut();
  }
  return (
    <section>
      <Menubar className="border-none rounded-full px-0 bg-muted">
        <MenubarMenu>
          <MenubarTrigger className="rounded-full py-0 px-0.5">
            <Avatar className="border-1 border-muted-foreground">
              <AvatarImage src={user.image} className="object-cover" />
              <AvatarFallback className="bg-primary text-center text-background">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </MenubarTrigger>
          <MenubarContent align="end" sideOffset={10}>
            <MenubarGroup className="my-0.5 mx-0">
              <MenubarItem className="flex gap-0 flex-col items-start">
                <span className="text-md md:text-lg font-extrabold">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </MenubarItem>
              <MenubarSeparator />
              {user.role === "ADMIN" && (
                <>
                  <MenubarItem className="p-2 flex gap-2">
                    <Link
                      href="/admin"
                      className="flex gap-2 items-center w-full"
                    >
                      <IconDashboard />
                      Admin Dashboard
                    </Link>
                  </MenubarItem>
                  <MenubarSeparator />
                </>
              )}
              <MenubarItem className="p-2">
                <Link
                  href="/bookmarks"
                  className="flex w-full gap-2 items-center"
                >
                  <IconBookmark />
                  Bookmarks
                </Link>
              </MenubarItem>
              <MenubarItem asChild className="p-2">
                <Link
                  href="/auth/settings"
                  className="flex w-full gap-2 items-center"
                >
                  <IconSettings />
                  Settings
                </Link>
              </MenubarItem>

              <MenubarSeparator />
              <MenubarItem
                onClick={logOut}
                className="p-2 bg-red-500 text-white flex gap-2"
              >
                <IconLogout2 />
                Logout
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </section>
  );
}
