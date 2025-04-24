"use client";

import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Users, ListRestart, Settings2, LogOutIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "@/components/ui/label";

export default function Navbar({
  historyModal,
  setHistoryModal,
}: {
  historyModal: boolean;
  setHistoryModal: () => void;
}) {
  return (
    <nav className="py-5 px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
      <div>
        <Image src="/logo.png" width={100} height={100} alt="" />
      </div>
      <div>
        <ul className="flex items-center gap-5">
          <li className="flex items-center gap-2">
            <Switch id="dark-mode" className="hover:cursor-pointer " />
            <Label htmlFor="dark-mode">Dark</Label>
          </li>
          <li className="hover:cursor-pointer" onClick={setHistoryModal}>
            <ListRestart />
          </li>
          <li className="">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-10 h-10 hover:cursor-pointer">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="User Avatar"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-10">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="hover:bg-slate-100 hover:cursor-pointer">
                    <Users />
                    <span className="ml-2 block hover:bg-slate-100">
                      Profile
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-slate-100 hover:cursor-pointer">
                    <Settings2 />
                    <span className="ml-2">Setting</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-slate-100 hover:cursor-pointer">
                  <LogOutIcon />
                  <span className="ml-2">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </div>
    </nav>
  );
}
