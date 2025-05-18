import React, { useState } from "react";
import { ArrowBigUpDash, Database, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiMysql, DiPostgresql } from "react-icons/di";
import { GrOracle } from "react-icons/gr";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
            <div className="flex items-center space-x-2">
              <div className="hover:bg-accent hover:rounded-md transition-all duration-200 px-1 border rounded-lg">
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
                      <SelectItem
                        value="llama3.2-70b"
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          <FacebookIcon className="mr-2 h-4 w-4" />
                          <span className="">Llama 3.2 (70B)</span>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Dialog>
                  <DialogTrigger className="flex items-center space-x-2 border px-4 py-1.5 rounded-lg hover:bg-accent hover:cursor-pointer transition">
                    <Database width={16} />
                    <span className="text-sm">Connect to Database</span>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="text-lg flex items-center gap-2">
                        🗃️ Connect Your Database
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Easily connect your own database to get started. We
                        support MySQL, PostgreSQL, and Oracle. Your credentials
                        are secure 🔐
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="mysql" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                          value="mysql"
                          className="flex items-center gap-1"
                        >
                          <DiMysql size={20} />
                          <span className="text-xs">MySQL</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="postgree"
                          className="flex items-center gap-1"
                        >
                          <DiPostgresql size={20} />
                          <span className="text-xs">PostgreSQL</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="oracle"
                          className="flex items-center gap-1"
                        >
                          <GrOracle size={18} />
                          <span className="text-xs">Oracle</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="mysql">
                        <div className="space-y-3 pt-4">
                          <p className="text-sm text-muted-foreground">
                            🛠️ Enter your MySQL credentials
                          </p>
                          <Input placeholder="🔗 Host (e.g., localhost)" />
                          <Input placeholder="📍 Port (default: 3306)" />
                          <Input placeholder="🗄️ Database Name" />
                          <Input placeholder="👤 Username" />
                          <Input type="password" placeholder="🔒 Password" />
                          <Button className="w-full mt-2">
                            🚀 Connect to MySQL
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="postgree">
                        <div className="space-y-3 pt-4">
                          <p className="text-sm text-muted-foreground">
                            🛠️ Enter your PostgreSQL credentials
                          </p>
                          <Input placeholder="🔗 Host (e.g., localhost)" />
                          <Input placeholder="📍 Port (default: 5432)" />
                          <Input placeholder="🗄️ Database Name" />
                          <Input placeholder="👤 Username" />
                          <Input type="password" placeholder="🔒 Password" />
                          <Button className="w-full mt-2">
                            🚀 Connect to PostgreSQL
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="oracle">
                        <div className="space-y-3 pt-4">
                          <p className="text-sm text-muted-foreground">
                            🛠️ Enter your Oracle DB credentials
                          </p>
                          <Input placeholder="🔗 Host (e.g., localhost)" />
                          <Input placeholder="📍 Port (default: 1521)" />
                          <Input placeholder="📡 Service Name / SID" />
                          <Input placeholder="👤 Username" />
                          <Input type="password" placeholder="🔒 Password" />
                          <Button className="w-full mt-2">
                            🚀 Connect to Oracle
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
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
