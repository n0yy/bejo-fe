"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { pinata } from "@/lib/pinata/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { FileIcon, XIcon } from "lucide-react";

// Define FileList type check function that works on both client and server
const isFileList = (value: any): value is FileList => {
  return typeof window !== "undefined" && value instanceof FileList;
};

export default function AddKnowledge({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState<string[]>([]);
  const [categoryLevel, setCategoryLevel] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    type: string;
    size: number;
    url?: string;
  } | null>(null);

  useEffect(() => {
    params.then((resolved) => {
      setSlug(resolved.slug);
      setCategoryLevel(parseInt(resolved.slug[1].split("-")[1]));
    });
  }, [params]);

  // const category = slug[1].split("-")[1];
  console.log(categoryLevel);

  // Define zod schema with safe type checking
  const formSchema = z.object({
    file: z
      .any()
      .optional()
      .refine(
        (value) => {
          if (!value || !isFileList(value) || value.length === 0) return true;
          const file = value[0];
          return [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/csv",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].includes(file.type);
        },
        {
          message: "Only PDF, DOCX, CSV, TXT, PPTX, or XLSX files are allowed.",
        }
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Create object URL for preview when possible
      const previewData: {
        name: string;
        type: string;
        size: number;
        url?: string;
      } = {
        name: file.name,
        type: file.type,
        size: file.size,
      };

      // For files that can be previewed in the browser
      if (
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.type === "text/plain"
      ) {
        previewData.url = URL.createObjectURL(file);
      }

      setFilePreview(previewData);
      form.setValue("file", files);
    } else {
      setFilePreview(null);
    }
  };

  const clearFileSelection = () => {
    form.setValue("file", undefined);
    setFilePreview(null);
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (filePreview?.url) {
        URL.revokeObjectURL(filePreview.url);
      }
    };
  }, [filePreview]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.file || !isFileList(data.file) || data.file.length === 0) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      const file = data.file[0];

      // Show initial upload progress
      toast.loading("Uploading file to Pinata 🪅...", {
        id: "upload-progress",
      });

      // Get signed upload URL
      const urlRequest = await fetch("/api/upload-file");
      const urlResponse = await urlRequest.json();
      const upload = await pinata.upload.public.file(file).url(urlResponse.url);

      const cid = upload.cid;

      // Get downloadable URL from pinata
      const response = await fetch("/api/get-file", {
        method: "POST",
        body: JSON.stringify({ cid }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { url } = await response.json();

      // Dismiss upload toast and start embedding
      toast.dismiss("upload-progress");
      toast.loading("Starting embedding process...", {
        id: "embedding-progress",
      });

      // Start SSE connection to embedding endpoint
      const eventSource = new EventSource(
        `http://localhost:8000/knowledge/embed?file_path=${encodeURIComponent(
          url
        )}&category=${categoryLevel}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE data:", data); // For debugging

          switch (data.status) {
            case "started":
              toast.loading(
                `Starting embedding: ${data.total_docs} document(s) → ${data.collections.length} collection(s)`,
                { id: "embedding-progress" }
              );
              break;

            case "progress":
              const progressText = `Embedding ${data.doc_index}/${data.total_docs} to ${data.collection} (${data.progress_percent}%)`;
              toast.loading(progressText, { id: "embedding-progress" });
              break;

            case "complete":
              toast.success(
                `Embedding complete! ${data.total_docs} document(s) embedded to ${data.collections.length} collection(s) (Level ${data.category_level})`,
                { id: "embedding-progress", duration: 5000 }
              );
              eventSource.close();
              form.reset();
              clearFileSelection();
              break;

            case "error":
              toast.error(`Embedding error: ${data.message}`, {
                id: "embedding-progress",
                duration: 8000,
              });
              eventSource.close();
              break;

            default:
              console.warn("Unknown SSE status:", data.status);
          }
        } catch (parseError) {
          console.error("Failed to parse SSE data:", parseError);
          toast.error("Failed to parse server response", {
            id: "embedding-progress",
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        toast.error("Connection to embedding service failed", {
          id: "embedding-progress",
        });
        eventSource.close();
      };

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        toast.loading("Connected to embedding service...", {
          id: "embedding-progress",
        });
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.dismiss("upload-progress");
      toast.dismiss("embedding-progress");
    } finally {
      setUploading(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Knowledge", href: "/dashboard" },
    { label: slug[1] ?? "Loading...", isCurrentPage: true },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("wordprocessingml")) return "📝";
    if (fileType.includes("spreadsheetml")) return "📊";
    if (fileType.includes("presentationml")) return "📑";
    if (fileType === "text/csv") return "📈";
    if (fileType === "text/plain") return "📃";
    return "📁";
  };

  return (
    <div className="p-10">
      <DashboardHeader
        title={`Add Knowledge for ${slug[1] ?? "..."}`}
        breadcrumbs={breadcrumbs}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-10 space-y-6"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.docx,.csv,.txt,.pptx,.xlsx"
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {filePreview && (
            <Card className="p-4 mt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getFileIcon(filePreview.type)}
                  </div>
                  <div>
                    <p className="font-medium">{filePreview.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(filePreview.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFileSelection}
                  className="h-8 w-8 p-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              {filePreview.url && (
                <div className="mt-4">
                  {filePreview.type === "application/pdf" && (
                    <div className="border rounded-md">
                      <iframe
                        src={filePreview.url}
                        className="w-full h-96 border-0"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                  {filePreview.type === "text/plain" && (
                    <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-auto">
                      <iframe
                        src={filePreview.url}
                        className="w-full h-full border-0"
                        title="Text Preview"
                      />
                    </div>
                  )}
                </div>
              )}

              {!filePreview.url && (
                <div className="flex justify-center items-center mt-4 h-24 bg-gray-50 rounded-md">
                  <FileIcon className="h-12 w-12 text-gray-400" />
                  <p className="ml-2 text-gray-500">Preview not available</p>
                </div>
              )}
            </Card>
          )}

          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
