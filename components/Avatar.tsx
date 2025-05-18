"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function Avatarr() {
  const { data: session, status } = useSession();

  return (
    <Avatar className="w-8 h-8 md:w-10 md:h-10 hover:cursor-pointer hover:ring-2 ring-primary transition-all">
      <AvatarImage
        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${session?.user?.name}`}
        alt="User Avatar"
      />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}
