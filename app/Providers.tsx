"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
      </ThemeProvider>
    </SessionProvider>
  );
}
