"use client";

import Image from "next/image";
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
import {
  Users,
  ListRestart,
  Settings2,
  LogOutIcon,
  Moon,
  Sun,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar({
  historyModal,
  setHistoryModal,
}: {
  historyModal: boolean;
  setHistoryModal: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="py-5 px-4 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-10 bg-white/10 dark:bg-black/10  backdrop-blur-sm">
      <div>
        <Image
          src="/logo.png"
          width={100}
          height={100}
          alt="Logo"
          className={theme === "dark" ? "invert" : ""}
        />
      </div>
      <div>
        <ul className="flex items-center gap-3 md:gap-5">
          <li className="flex items-center gap-2">
            <Switch
              id="dark-mode"
              className="hover:cursor-pointer"
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            />
            <Label
              htmlFor="dark-mode"
              className="hidden sm:flex items-center gap-1"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="h-4 w-4" /> Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" /> Light
                </>
              )}
            </Label>
          </li>
          <li
            className="hover:cursor-pointer p-2 hover:bg-accent rounded-full transition-colors"
            onClick={setHistoryModal}
          >
            <ListRestart className="h-5 w-5" />
          </li>
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8 md:w-10 md:h-10 hover:cursor-pointer hover:ring-2 ring-primary transition-all">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="User Avatar"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-2 md:mr-10">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings2 className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </div>
    </nav>
  );
}
