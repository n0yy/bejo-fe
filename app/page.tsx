"use client";

import HistoryModal from "@/components/HistoryModal";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundGrid from "@/components/BackgroundGrid";
import PromptInput from "@/components/PromptInput";

export default function Home() {
  const [historyModal, setHistoryModal] = useState<boolean>(false);

  // Menangani penekanan tombol Escape untuk menutup modal
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
      <Navbar
        historyModal={historyModal}
        setHistoryModal={() => setHistoryModal(!historyModal)}
      />
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <BackgroundGrid />
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Halo, Semangat Pagi John Doe!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-4xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Recusandae tempore eos nisi officia? Assumenda fugiat, eveniet
              nobis praesentium ipsum rerum.
            </p>
          </header>

          {/* <PromptInput /> */}
          <PromptInput />
        </div>

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
      </main>
    </>
  );
}
