// File: app/(auth)/layout.tsx
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    template: "%s - BEJO Assistant",
    default: "Authentication - BEJO Assistant",
  },
  description: "Authentication page for BEJO AI Assistant.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
      <header className=" max-w-md flex flex-col items-center">
        <Image
          src="/bejo.png"
          width={64}
          height={64}
          alt="bejo"
          className="dark:invert"
        />
      </header>

      {children}
    </div>
  );
}
