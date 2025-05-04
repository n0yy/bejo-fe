"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { ImSpinner10 } from "react-icons/im";
export default function ChatInterface() {
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState([
    { role: "user", content: "Hello!" },
    {
      role: "assistant",
      content:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Reiciendis eaque repudiandae inventore alias necessitatibus ex dignissimos saepe, consequuntur non quisquam odit expedita accusantium. Natus debitis laborum consequatur minus rerum unde ratione sunt magnam assumenda? Dolorem ullam magni, aliquam veritatis sint dicta omnis laboriosam, nam perspiciatis exercitationem maxime sequi temporibus at.",
    },
  ]);

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 border">
      <div className="w-full max-w-2xl p-4 space-y-5 relative">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-lg ${
                message.role === "user"
                  ? "bg-slate-200 text-slate-800"
                  : "text-black"
              }`}
            >
              {message.role === "assistant" && (
                <span>
                  <Image src="/bejo.png" width={30} height={30} alt="Bejo" />
                </span>
              )}
              {message.content}
            </div>
          </div>
        ))}

        {/* Inputs */}
        <div className="flex items-center absolute bottom-5 w-full space-x-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-md border border-black/50"
            placeholder="Type your message..."
          />
          <button
            className={`p-2 flex items-center justify-center w-10 h-10 rounded-md bg-slate-800 text-white hover:bg-slate-700 hover:cursor-pointer`}
            disabled={loading}
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
  );
}
