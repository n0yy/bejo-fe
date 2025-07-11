"use client";

import { useState } from "react";
import { ArrowBigUpDash, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ModelSelector from "./ModelSelector";
import { useSession } from "next-auth/react";
import CategorySelector from "./CategorySelector";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [knowledgeCategory, setKnowledgeCategory] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const existingMessage = localStorage.getItem("initialMessage");

    if (existingMessage) {
      localStorage.removeItem("initialMessage");
    }

    const response = await fetch(`/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: session?.user?.id }),
    });

    const { threadId } = await response.json();

    if (threadId) {
      localStorage.setItem("initialMessage", prompt);
      localStorage.setItem("threadId", threadId);
      localStorage.setItem("knowledgeCategory", knowledgeCategory);
      router.push(`ask/${threadId}`);
    } else {
      console.error("[PromptInput] Failed to create thread");
      return <div>Something went wrong in the session</div>;
    }
  };

  return (
    <div className="w-11/12 max-w-4xl mx-auto mt-7 dark:shadow-yellow-200 rounded-tr-lg rounded-br-lg md:rounded-lg bg-transparent absolute md:relative bottom-5 shadow-xl md:shadow-md ">
      <form onSubmit={handleSubmit} className="space-y-2">
        <fieldset className="flex flex-col border border-input rounded-xl shadow focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-200 bg-white dark:invert">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tanyakan apapun di sini..."
            className="min-h-28 focus:ring-0 focus:outline-none border-0 bg-transparent p-3 resize-none dark:invert"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              const isMobile =
                typeof window !== "undefined" &&
                /Mobi|Android/i.test(navigator.userAgent);
              if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
          />

          <div className="flex items-center justify-between p-2 border-t border-input">
            <div className="flex items-center space-x-0 md:-space-x-2">
              <ModelSelector value={model} onChange={setModel} />
              {Number(session?.user?.category) !== 1 && (
                <CategorySelector
                  value={knowledgeCategory}
                  onChange={setKnowledgeCategory}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-md w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowBigUpDash className="h-5 w-5" />
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
