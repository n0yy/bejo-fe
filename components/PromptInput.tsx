import { useState } from "react";
import { ArrowBigUpDash, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ModelSelector from "./ModelSelector";
import DatabaseConnector from "./DatabaseConnector";
import { useSession } from "next-auth/react";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Cek apakah ada pesan di localStorage
    const existingMessage = localStorage.getItem("initialMessage");

    if (existingMessage) {
      localStorage.removeItem("initialMessage");
    }

    console.log("[PromptInput] Creating new thread...");
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
      router.push(`ask/${threadId}`);
    } else {
      console.error("[PromptInput] Failed to create thread");
      return <div>Something went wrong in the session</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 shadow-md dark:shadow-yellow-200 rounded-lg bg-transparent">
      <form onSubmit={handleSubmit} className="space-y-2">
        <fieldset className="flex flex-col border border-input rounded-xl shadow focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-200 bg-white dark:invert">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tanyakan apapun di sini..."
            className="min-h-28 focus:ring-0 focus:outline-none border-0 bg-transparent p-3 resize-none dark:invert"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between p-2 border-t border-input">
            <div className="flex items-center space-x-2">
              <ModelSelector value={model} onChange={setModel} />
              <DatabaseConnector />
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
