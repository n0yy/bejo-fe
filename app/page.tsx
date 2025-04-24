"use client";

import HistoryModal from "@/components/HistoryModal";
import Navbar from "@/components/Navbar";
import PromptInput from "@/components/PromptInput";
import { useState } from "react";

export default function Home() {
  const [historyModal, setHistoryModal] = useState<boolean>(false);
  return (
    <>
      <Navbar
        historyModal={historyModal}
        setHistoryModal={() => setHistoryModal(!historyModal)}
      />
      <main className="flex min-h-screen flex-col items-center justify-center">
        <header className="text-center -space-y-3">
          <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
          <p className="mt-4 text-lg text-slate-500">
            Lorem ipsum dolor sit amet consectetur adipisicing.
          </p>
        </header>
        <PromptInput />
        {historyModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black opacity-50 z-40 backdrop-blur-sm h-screen w-full cursor-pointer"
              onClick={() => setHistoryModal(false)}
            />
            <HistoryModal />
          </>
        )}
      </main>
    </>
  );
}
