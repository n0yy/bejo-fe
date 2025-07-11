"use client";

import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ChatHistoryItem {
  threadId: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

// Helper untuk menghapus markdown dan link
function getPreview(text: string, maxLength = 100) {
  // Hapus markdown dan link
  let clean = text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_~`>#-]/g, "")
    .replace(/!\[(.*?)\]\((.*?)\)/g, "")
    .replace(/\n/g, " ");
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength) + "...";
  }
  return clean.trim();
}

export default function HistoryModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!session?.user?.id) return;

      try {
        const chatHistoryRef = collection(db, "chatHistory");
        const q = query(chatHistoryRef, where("userId", "==", session.user.id));

        const querySnapshot = await getDocs(q);

        const history = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const messages = data.messages || [];
          return {
            threadId: doc.id,
            lastMessage:
              messages[messages.length - 1]?.content || "No messages",
            timestamp: messages[messages.length - 1]?.timestamp || Date.now(),
            messageCount: messages.length,
          };
        });

        setChatHistory(history);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [session?.user?.id]);

  const filteredHistory = chatHistory.filter((chat) =>
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (threadId: string) => {
    router.push(`/ask/${threadId}`);
  };

  return (
    <div className="z-50 min-w-7xl max-h-8/12 p-7 rounded-lg shadow-lg inset-x-0 bg-secondary">
      <header className="">
        <h1 className="text-xl mb-3 font-semibold">Riwayat Chat</h1>
        <div className="flex items-center gap-7 mb-7">
          <form className="block w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Cari riwayat chat..."
              className="w-full border-slate-300 border focus:ring-none focus:outline-none py-1.5 px-3 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Search className="text-slate-400" />
        </div>
      </header>
      <div className="flex">
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchQuery
                ? "Tidak ada riwayat chat yang ditemukan"
                : "Belum ada riwayat chat"}
            </div>
          ) : (
            <ul className="space-y-3 cursor-pointer pr-7 max-h-96 overflow-y-scroll">
              {filteredHistory.map((chat) => (
                <li
                  key={chat.threadId}
                  className="hover:bg-slate-200 rounded py-2 px-5 transition-colors"
                  onClick={() => handleChatSelect(chat.threadId)}
                  title={getPreview(chat.lastMessage, 300)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {getPreview(chat.lastMessage)}
                      </p>
                      <p className="text-xs mt-1">
                        {format(chat.timestamp, "d MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <span className="ml-2 text-xs text-slate-500">
                      {chat.messageCount} pesan
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
