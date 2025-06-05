"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FileUpload from "@/components/FileUploader";
import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";

const data = [
  {
    id: 1,
    title: "Add Knowledge 1 -- Field & Control",
    description: "Description 1",
    url: "/dashboard/knowledge/add/level-1",
  },
  {
    id: 2,
    title: "Add Knowledge 2 -- Supervisory",
    description: "Description 2",
    url: "/dashboard/knowledge/add/level-2",
  },
  {
    id: 3,
    title: "Add Knowledge 3 -- Planning",
    description: "Description 3",
    url: "/dashboard/knowledge/add/level-3",
  },
  {
    id: 4,
    title: "Add Knowledge 4 -- Management",
    description: "Description 4",
    url: "/dashboard/knowledge/add/level-4",
  },
];

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default function AddKnowledge({ params }: PageProps) {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<{
    step: string;
    message: string;
    progress: number;
  } | null>(null);

  const [resolvedParams, setResolvedParams] = useState<{
    slug: string[];
  } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Loading state while params are being resolved
  if (!resolvedParams) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const slug = resolvedParams.slug;
  const categoryLevel = slug[1].split("-")[1];
  if (parseInt(categoryLevel) < 1 || parseInt(categoryLevel) > 4) {
    return notFound();
  }
  const fullSlug = `/dashboard/knowledge/${slug.join("/")}`;

  const matched = data.find((item) => item.url === fullSlug);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Knowledge", href: "/dashboard/knowledge" },
    {
      label: matched?.title.split(" -- ")[1] ?? "Unknown",
      isCurrentPage: true,
    },
  ];

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category_level", categoryLevel);

      const response = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setUploadProgress(data);
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress({
        step: "error",
        message: "Upload failed. Please try again.",
        progress: 0,
      });
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-6">
        <DashboardHeader
          title={matched?.title.split(" -- ")[1] ?? "Knowledge Not Found"}
          breadcrumbs={breadcrumbs}
        />
        <div className="mt-4 text-gray-600">
          {matched?.description ??
            "No description available for this knowledge level."}
        </div>
        <div className="mt-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <FileUpload onUpload={handleUpload} />
            {uploadProgress && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  {uploadProgress.message}
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
