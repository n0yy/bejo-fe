import React, { useState } from "react";
import { ArrowBigUpDash, Loader2 } from "lucide-react";
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

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    // Simulasi pengiriman prompt
    setIsSubmitting(true);

    // Di sini Anda akan menambahkan logika untuk mengirim prompt ke AI
    console.log(`Sending prompt: "${prompt}" to model: ${model}`);

    // Simulasi respons dari server
    setTimeout(() => {
      setIsSubmitting(false);
      setPrompt("");
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <fieldset className="flex flex-col border border-input rounded-lg focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-200">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tanyakan apapun di sini..."
            className="min-h-28 focus:ring-0 focus:outline-none border-0 bg-transparent p-3 resize-none"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between p-2 border-t border-input">
            <div className="hover:bg-accent hover:rounded-md transition-all duration-200 px-1">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="cursor-pointer flex items-center border-0 bg-transparent focus:ring-0 focus:outline-none">
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
                        <span>Llama 3.2 (70B)</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-md w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
