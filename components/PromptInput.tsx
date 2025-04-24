import React from "react";
import { ArrowBigUpDash, FacebookIcon, MailOpenIcon } from "lucide-react";
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

export default function PromptInput() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <fieldset className="flex flex-col border p-2 rounded-lg">
        <textarea
          name=""
          id=""
          placeholder="Ask your question.."
          className="focus:ring-0 focus:outline-none focus:border-slate-900 border-slate-300 rounded-md p-2"
        />
        <div className="flex items-center justify-between">
          <div className="scale-80 hover:bg-slate-100 hover:rounded-md transition-all duration-200">
            <Select>
              <SelectTrigger className="cursor-pointer flex items-center">
                <RiOpenaiFill className="mt-1" />
                <SelectValue placeholder="gpt-4o" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="w-40">
                  <SelectLabel>Select Model</SelectLabel>
                  <SelectItem
                    value="gemini-2.0-flash"
                    className="text-slate-800 text-xs cursor-pointer"
                  >
                    <FaGoogle className="mr-1" />
                    Gemini 2.0 Flash
                  </SelectItem>
                  <SelectItem
                    value="llama3.2-70b"
                    className="text-slate-800 text-xs cursor-pointer"
                  >
                    <FacebookIcon className="mr-1" />
                    Llama 3.2
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <button className="bg-slate-900 hover:bg-slate-700 hover:cursor-pointer transition-all duration-200 text-white p-1 rounded-md w-8 h-8">
            <ArrowBigUpDash className="mr-2" />
          </button>
        </div>
      </fieldset>
    </div>
  );
}
