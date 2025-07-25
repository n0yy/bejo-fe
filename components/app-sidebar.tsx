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
          <SidebarMenuItem className="flex items-center w-full">
            <Link href="/" className="flex items-center justify-between">
              <Image
                src="/bejo.png"
                width={56}
                height={56}
                alt="Logo Bejo"
                className="dark:invert"
              />
              <div>
                <span className="text-xl font-bold mr-3">Bejo AI</span>
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
                  <Brain className="h-4 w-4" />
                  <span>Knowledge</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Add</SidebarMenuSubButton>
                    <SidebarMenuSub>
                      {session?.user?.role === "admin" && (
                        <div>
                          {session?.user?.category === "1" && (
                            <Link href="/dashboard/knowledge/add/1">
                              <SidebarMenuButton className="text-slate-500">
                                Level 1: Control & Field
                              </SidebarMenuButton>
                            </Link>
                          )}
                          {session?.user?.category === "2" && (
                            <>
                              <Link href="/dashboard/knowledge/add/1">
                                <SidebarMenuButton className="text-slate-500">
                                  Level 1: Control & Field
                                </SidebarMenuButton>
                              </Link>
                              <Link href="/dashboard/knowledge/add/2">
                                <SidebarMenuButton className="text-slate-500">
                                  Level 2: Supervisory
                                </SidebarMenuButton>
                              </Link>
                            </>
                          )}
                          {session?.user?.category === "3" && (
                            <>
                              <Link href="/dashboard/knowledge/add/1">
                                <SidebarMenuButton className="text-slate-500">
                                  Level 1: Control & Field
                                </SidebarMenuButton>
                              </Link>
                              <Link href="/dashboard/knowledge/add/2">
                                <SidebarMenuButton className="text-slate-500">
                                  Level 2: Supervisory
                                </SidebarMenuButton>
                              </Link>
                              <Link href="/dashboard/knowledge/add/3">
                                <SidebarMenuButton className="text-slate-500">
                                  Level 3: Planning
                                </SidebarMenuButton>
                              </Link>
                            </>
                          )}
                        </div>
                      )}
                      {session?.user?.category === "4" && (
                        <>
                          <Link href="/dashboard/knowledge/add/1">
                            <SidebarMenuButton className="text-slate-500">
                              Level 1: Control & Field
                            </SidebarMenuButton>
                          </Link>
                          <Link href="/dashboard/knowledge/add/2">
                            <SidebarMenuButton className="text-slate-500">
                              Level 2: Supervisory
                            </SidebarMenuButton>
                          </Link>
                          <Link href="/dashboard/knowledge/add/3">
                            <SidebarMenuButton className="text-slate-500">
                              Level 3: Planning
                            </SidebarMenuButton>
                          </Link>
                          <Link href="/dashboard/knowledge/add/4">
                            <SidebarMenuButton className="text-slate-500">
                              Level 4: Management
                            </SidebarMenuButton>
                          </Link>
                        </>
                      )}
                    </SidebarMenuSub>
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
