// File: components/ModelSelector.tsx
import React from "react";
import { FaGoogle } from "react-icons/fa";
import { RiOpenaiFill } from "react-icons/ri";
import { FacebookIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="hover:bg-accent hover:rounded-md transition-all duration-200 px-1 border rounded-lg">
      <Select value={value} onValueChange={onChange}>
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
            <SelectItem value="gemini-2.0-flash" className="cursor-pointer">
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
  );
}
