"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { ImSpinner10 } from "react-icons/im";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getResponse = async (message: string) => {
    setLoading(true);

    // Tambahkan pesan pengguna ke daftar pesan terlebih dahulu
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Tambahkan placeholder pesan assistant yang sedang loading
    const pendingAssistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPendingMessage(pendingAssistantMessage);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ask/${uuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: message }),
        }
      );
      const data = await response.json();

      // Buat objek pesan baru dari respons API
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "",
        timestamp: new Date().toISOString(),
      };

      // Update pesan setelah respons diterima
      setPendingMessage(null);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error(error);
      // Jika error, hapus pesan placeholder assistant
      setPendingMessage(null);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessage]);

  useEffect(() => {
    const initialInput = localStorage.getItem("initialMessage");
    if (initialInput) {
      getResponse(initialInput);
      // Hapus item dari localStorage agar tidak dipanggil lagi saat refresh
      localStorage.removeItem("initialMessage");
    }
  }, [uuid]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim() || loading) return;
    getResponse(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen bg-white dark:invert">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0 py-6 w-full flex justify-center  mt-20">
          <div className="w-full max-w-7xl space-y-4 pb-10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-6 py-3 rounded-xl ${
                    message.role === "user"
                      ? "bg-slate-200 text-slate-800 max-w-lg"
                      : " text-black w-full"
                  }`}
                >
                  {message.role === "assistant" && (
                    <span className="inline-block mr-2 align-middle">
                      <Image
                        src="/bejo.png"
                        width={30}
                        height={30}
                        alt="Bejo"
                      />
                    </span>
                  )}
                  <div className="text-slate-900 prose prose-sm">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </Markdown>
                    {message.role === "assistant" && (
                      <span className="block text-xs mt-1 text-start text-slate-400">
                        {new Date(message.timestamp).toLocaleString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pending message (loading) */}
            {pendingMessage && (
              <div className="flex justify-start">
                <div className="px-6 py-3 rounded-xl text-black w-full">
                  <span className="inline-block mr-2 align-middle">
                    <Image src="/bejo.png" width={30} height={30} alt="Bejo" />
                  </span>
                  <span className="align-middle flex items-center">
                    <span className="ml-2 animate-pulse block text-slate-300 text-sm">
                      loading...
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 py-6 w-full flex justify-center">
          <div className="flex items-center w-full max-w-4xl space-x-3 dark:invert">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-4 py-2 rounded-md border border-slate-300 text-slate-800"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="p-2 w-10 h-10 rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading || !input.trim()}
              onClick={() => handleSend(input)}
            >
              {!loading ? (
                <Send width={16} />
              ) : (
                <ImSpinner10 width={16} className="animate-spin" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
