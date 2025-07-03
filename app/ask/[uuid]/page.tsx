"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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

interface ExtendedChatMessage {
  role: string;
  content: string;
  timestamp: number;
  sources?: any[];
}

interface ExtendedChatHistory extends Omit<ChatHistory, "messages"> {
  messages: ExtendedChatMessage[];
}
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
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: session, status } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uuid && !isSubscribed) {
      const unsubscribe = subscribeToChatHistory(uuid as string, (history) => {
        if (history) {
          setMessages(
            history.messages.map((msg: any) => ({
              role: msg.role === "user" ? "user" : "assistant",
              response: msg.content,
              timestamp: new Date(msg.timestamp).toISOString(),
              sources: msg.sources || [],
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
          history.messages.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "assistant",
            response: msg.content,
            timestamp: new Date(msg.timestamp).toISOString(),
            sources: msg.sources || [],
          }))
        );
      }
    };
    fetchHistory();
  }, [uuid]);

  const getResponse = useCallback(
    async (message: string) => {
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

      setMessages((prev) => [...prev, userMessage]);
      setPendingMessage(pendingAssistantMessage);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${uuid}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: message,
              category: session?.user?.category,
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
        setMessages((prev) => [...prev, assistantMessage]);

        if (session?.user?.id) {
          try {
            const chatHistory: ExtendedChatHistory = {
              userId: session.user.id,
              threadId: uuid as string,
              messages: [...messages, userMessage, assistantMessage].map(
                (msg) => ({
                  role: msg.role,
                  content: msg.response,
                  timestamp: new Date(msg.timestamp).getTime(),
                  sources: msg.sources || [],
                })
              ),
            };
            await storeChatHistory(chatHistory as any);
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
    },
    [uuid, session?.user?.id, session?.user?.category, messages]
  );

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
                  <div
                    className={`${
                      message.role === "assistant"
                        ? "prose max-w-none dark:prose-invert"
                        : ""
                    }`}
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
