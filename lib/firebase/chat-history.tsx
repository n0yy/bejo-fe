import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  onSnapshot,
  query,
  collection,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./app";

export type ChatHistory = {
  userId: string;
  threadId: string;
  messages: {
    role: string;
    content: string;
    timestamp: number;
  }[];
};

const CACHE_KEY = "chat_history_cache";
const BATCH_SIZE = 20;

// Cache management
const getCachedHistory = (threadId: string): ChatHistory | null => {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(`${CACHE_KEY}_${threadId}`);
  return cached ? JSON.parse(cached) : null;
};

const setCachedHistory = (threadId: string, history: ChatHistory) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${CACHE_KEY}_${threadId}`, JSON.stringify(history));
};

// Batch store chat history
export const storeChatHistoryBatch = async (chatHistories: ChatHistory[]) => {
  const batch = writeBatch(db);

  chatHistories.forEach((history) => {
    const chatHistoryRef = doc(db, "chatHistory", history.threadId);
    batch.set(chatHistoryRef, history);
    setCachedHistory(history.threadId, history);
  });

  await batch.commit();
};

// Single store with cache
export const storeChatHistory = async (chatHistory: ChatHistory) => {
  const chatHistoryRef = doc(db, "chatHistory", chatHistory.threadId);
  await setDoc(chatHistoryRef, chatHistory);
  setCachedHistory(chatHistory.threadId, chatHistory);
};

// Get chat history with pagination
export const getChatHistory = async (threadId: string, lastDoc?: any) => {
  // Check cache first
  const cached = getCachedHistory(threadId);
  if (cached) return cached;

  const chatHistoryRef = doc(db, "chatHistory", threadId);
  const chatHistory = await getDoc(chatHistoryRef);
  const data = chatHistory.data() as ChatHistory;

  if (data) {
    setCachedHistory(threadId, data);
  }

  return data;
};

// Real-time listener
export const subscribeToChatHistory = (
  threadId: string,
  callback: (history: ChatHistory | null) => void
) => {
  const chatHistoryRef = doc(db, "chatHistory", threadId);

  return onSnapshot(chatHistoryRef, (doc) => {
    const data = doc.data() as ChatHistory;
    if (data) {
      setCachedHistory(threadId, data);
      callback(data);
    } else {
      callback(null);
    }
  });
};

export const deleteChatHistory = async (threadId: string) => {
  const chatHistoryRef = doc(db, "chatHistory", threadId);
  await deleteDoc(chatHistoryRef);
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${CACHE_KEY}_${threadId}`);
  }
};
