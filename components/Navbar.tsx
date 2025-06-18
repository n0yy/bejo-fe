"use client";

import Image from "next/image";
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
  LayoutDashboard,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import Avatarr from "./Avatar";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HistoryModal from "./HistoryModal";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const [historyModal, setHistoryModal] = useState<boolean>(false);
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && historyModal) {
        setHistoryModal(false);
      }
    };

    window.addEventListener("keydown", handleEscKeyPress);
    return () => window.removeEventListener("keydown", handleEscKeyPress);
  }, [historyModal]);

  return (
    <>
      <nav className="py-5 px-4 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-10 bg-white/10 dark:bg-black/10  backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <Image
            src="/bejo.png"
            width={54}
            height={54}
            alt="Logo"
            className={theme === "dark" ? "invert" : ""}
          />
          {session?.user?.role === "admin" && (
            <Badge variant={"outline"}>Admin</Badge>
          )}
        </Link>
        <div>
          <ul className="flex items-center gap-3 md:gap-5">
            <li className="flex items-center gap-2 mb-1">
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
              className="hover:cursor-pointer p-2 hover:bg-accent rounded-full transition-colors mb-1"
              onClick={() => setHistoryModal(!historyModal)}
            >
              <ListRestart className="h-5 w-5" />
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatarr />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2 md:mr-10">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {session?.user?.role === "admin" && (
                      <DropdownMenuItem className="cursor-pointer">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-4"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={"/settings"} className="flex items-center">
                        <Settings2 className="h-4 w-4 mr-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>
      </nav>

      <AnimatePresence>
        {historyModal && (
          <>
            {/* Overlay dengan animasi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm h-screen w-full cursor-pointer"
              onClick={() => setHistoryModal(false)}
            />

            {/* Modal dengan animasi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <HistoryModal />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
