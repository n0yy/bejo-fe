"use client";

import { Home, LogOut, User, Brain } from "lucide-react";

import { Badge } from "./ui/badge";
import { signOut, useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import Avatarr from "./Avatar";

// Menu items.
const applicationLinks = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "User",
    url: "/dashboard/users",
    icon: User,
  },
];

export function AppSidebar() {
  const { data: session, status } = useSession();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center ">
            <Link href="/" className="flex items-center justify-between">
              <Image
                src="/bejo.png"
                width={56}
                height={56}
                alt="Logo Bejo"
                className="dark:invert"
              />
              <div>
                <span className="text-xl font-bold mr-14">Bejo AI</span>
                <Badge variant={"outline"} className="mt-1">
                  Admin
                </Badge>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AI Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link
                    href="/knowledge"
                    className="flex items-center space-x-2"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Knowledge</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Add</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Delete</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatarr />
              <div className="flex flex-col">
                <span className="font-semibold">{session?.user?.name}</span>
                <span className="text-xs text-slate-500">
                  {session?.user?.division}
                </span>
              </div>
            </div>
            <div className="hover:bg-red-100 p-2 rounded-md hover:cursor-pointer">
              <LogOut
                className="h-5 w-5 text-red-600"
                onClick={() => signOut()}
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
