"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { ImSpinner10 } from "react-icons/im";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import {
  ChatHistory,
  storeChatHistory,
  subscribeToChatHistory,
  getChatHistory,
} from "@/lib/firebase/chat-history";
import { toast } from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  response: string;
  timestamp: string;
}

export default function ChatInterface() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: session, status } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    if (uuid && !isSubscribed) {
      const unsubscribe = subscribeToChatHistory(uuid as string, (history) => {
        if (history) {
          setMessages(
            history.messages.map((msg) => ({
              role: msg.role === "user" ? "user" : "assistant",
              response: msg.content,
              timestamp: new Date(msg.timestamp).toISOString(),
            }))
          );
        }
      });
      setIsSubscribed(true);
      return () => unsubscribe();
    }
  }, [uuid, isSubscribed]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!uuid) return;
      const history = await getChatHistory(uuid as string);
      if (history && Array.isArray(history.messages)) {
        setMessages(
          history.messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            response: msg.content,
            timestamp: new Date(msg.timestamp).toISOString(),
          }))
        );
      }
    };
    fetchHistory();
  }, [uuid]);

  const getResponse = async (message: string) => {
    setLoading(true);

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

    // Optimistic update
    setMessages((prev) => [...prev, userMessage]);
    setPendingMessage(pendingAssistantMessage);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: message,
            category: session?.user?.category,
            user_id: session?.user?.id,
            thread_id: uuid,
          }),
        }
      );
      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        response: data.response || "",
        timestamp: new Date().toISOString(),
      };

      setPendingMessage(null);
      setMessages((prev) => [...prev, assistantMessage]);

      // Store chat history
      if (session?.user?.id) {
        try {
          const chatHistory: ChatHistory = {
            userId: session.user.id,
            threadId: uuid as string,
            messages: [...messages, userMessage, assistantMessage].map(
              (msg) => ({
                role: msg.role,
                content: msg.response,
                timestamp: new Date(msg.timestamp).getTime(),
              })
            ),
          };
          await storeChatHistory(chatHistory);
        } catch (error) {
          console.error("[ChatHistory] Failed to store chat history:", error);
          toast.error("Gagal menyimpan riwayat chat");
        }
      }
    } catch (error) {
      console.error("[AskPage] Error getting response:", error);
      setPendingMessage(null);
      toast.error("Terjadi kesalahan saat mendapatkan respons");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessage, status]);

  useEffect(() => {
    const initialInput = localStorage.getItem("initialMessage");

    if (initialInput) {
      getResponse(initialInput);
      localStorage.removeItem("initialMessage");
    }
  }, [uuid, status, getResponse]);

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
                  className={`px-6 py-3 rounded-l-lg rounded-tr-lg ${
                    message.role === "user"
                      ? "bg-slate-100 text-slate-800 max-w-lg"
                      : "bg-white text-black w-full"
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
                  <div
                    className={`${
                      message.role === "assistant"
                        ? "prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200"
                        : ""
                    }`}
                  >
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.response}
                    </Markdown>
                    {message.role === "assistant" && (
                      <span className="block text-xs mt-2 text-start text-slate-400">
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
