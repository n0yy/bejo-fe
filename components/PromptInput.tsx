import React, { useState, useEffect } from "react";
import { ArrowBigUpDash, Loader2, Router } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FaGoogle } from "react-icons/fa";
import { RiOpenaiFill } from "react-icons/ri";
import { FacebookIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: "test_12312" }),
    });
    const { session_id } = await response.json();
    if (session_id) {
      localStorage.setItem("startChat", prompt);
      router.push(`ask/${session_id}`);
    } else {
      return <div>Somethine went wrong in the session</div>;
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 bg-transparent shadow-md dark:shadow-yellow-200 rounded-lg">
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
            <div className="hover:bg-accent hover:rounded-md transition-all duration-200 px-1">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="cursor-pointer flex items-center border-0 bg-transparent focus:ring-0 focus:outline-none dark:text-white dark:invert">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Model</SelectLabel>
                    <SelectItem value="gpt-4o" className="cursor-pointer">
                      <div className="flex items-center">
                        <RiOpenaiFill className="mr-2 h-4 w-4" />
                        <span>GPT-4o</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="gemini-2.0-flash"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <FaGoogle className="mr-2 h-4 w-4" />
                        <span>Gemini 2.0 Flash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="llama3.2-70b" className="cursor-pointer">
                      <div className="flex items-center">
                        <FacebookIcon className="mr-2 h-4 w-4" />
                        <span className="">Llama 3.2 (70B)</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
