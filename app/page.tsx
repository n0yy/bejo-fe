"use client";

import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";
import PromptInput from "@/components/PromptInput";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [router, session, status]);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <BackgroundGrid />
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <header className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              Halo, Semangat Pagi {session?.user?.name}!
            </h1>
          </header>

          {/* <PromptInput /> */}
          <PromptInput />
        </div>
      </main>
    </>
  );
}
