"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { ImSpinner10 } from "react-icons/im";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Source {
  filename: string;
  document_id: string;
  file_path: string;
}

interface Message {
  role: "user" | "assistant";
  response: string;
  timestamp: string;
  sources?: Source[];
}

export default function ChatInterface() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);

  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history dari database
  const loadChatHistory = useCallback(async () => {
    if (!uuid) return;

    try {
      const response = await fetch(`/api/history?threadId=${uuid}`);
      const data = await response.json();

      if (data.success && data.histories.length > 0) {
        const historyMessages = data.histories[0].messages.map((msg: any) => ({
          role: msg.role,
          response: msg.content,
          timestamp: new Date(msg.timestamp).toISOString(),
          sources: msg.sources || [],
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, [uuid]);

  // Save chat history ke database
  const saveChatHistory = useCallback(
    async (newMessages: Message[]) => {
      if (!session?.user?.id || !uuid) return;

      try {
        const chatData = {
          userId: session.user.id,
          threadId: uuid as string,
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.response,
            timestamp: new Date(msg.timestamp).getTime(),
            sources: msg.sources || [],
          })),
        };

        const response = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error saving chat history:", error);
        toast.error("Gagal menyimpan riwayat chat");
      }
    },
    [session?.user?.id, uuid]
  );

  const getResponse = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return;

      setLoading(true);
      setInput("");

      const userMessage: Message = {
        role: "user",
        response: message,
        timestamp: new Date().toISOString(),
      };

      const pendingAssistantMessage: Message = {
        role: "assistant",
        response: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setPendingMessage(pendingAssistantMessage);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${uuid}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: message,
              category: localStorage.getItem("knowledgeCategory") || "1",
            }),
          }
        );

        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          response: data.answer || "",
          timestamp: new Date().toISOString(),
          sources: data.sources || [],
        };

        setPendingMessage(null);
        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);

        await saveChatHistory(updatedMessages);
      } catch (error) {
        console.error("Error getting response:", error);
        setPendingMessage(null);
        toast.error("Terjadi kesalahan saat mendapatkan respons");
      } finally {
        setLoading(false);
      }
    },
    [uuid, messages, saveChatHistory, loading]
  );

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    const initialInput = localStorage.getItem("initialMessage");
    if (initialInput) {
      getResponse(initialInput);
      localStorage.removeItem("initialMessage");
    }
  }, [getResponse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      getResponse(input);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen bg-white dark:invert">
        <div className="flex-1 overflow-y-auto px-4 md:px-0 py-6 w-full flex justify-center mt-20">
          <div className="w-full max-w-7xl space-y-4 pb-10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-6 py-3 rounded-l-lg rounded-tr-lg ${
                    message.role === "user"
                      ? "bg-slate-100 text-slate-800 max-w-lg"
                      : "bg-white text-black w-full"
                  }`}
                >
                  <div
                    className={
                      message.role === "assistant" ? "prose max-w-none" : ""
                    }
                  >
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.response}
                    </Markdown>

                    {message.role === "assistant" && (
                      <>
                        {message.sources && message.sources.length > 0 && (
                          <div className="block text-xs mt-4 text-start text-slate-500">
                            <div className="font-semibold mb-1">Sources:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {message.sources.map((source, sourceIndex) => (
                                <li key={sourceIndex} className="truncate">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/${source.file_path}`}
                                    target="_blank"
                                  >
                                    {source.filename}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <span className="block text-xs mt-2 text-start text-slate-500">
                          {new Date(message.timestamp).toLocaleString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pendingMessage && (
              <div className="flex justify-start">
                <div className="px-6 py-3 rounded-xl text-black w-full">
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

        <div className="px-4 py-6 w-full flex justify-center">
          <div className="flex items-center w-full max-w-4xl space-x-3 dark:invert">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-4 py-2 rounded-md border border-slate-400"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="p-2 w-10 h-10 rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading || !input.trim()}
              onClick={() => getResponse(input)}
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
