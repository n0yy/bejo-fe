"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useState, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Trash2, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const data = [
  {
    id: 1,
    title: "Add Knowledge 1 -- Field & Control",
    description: "Description 1",
    url: "/dashboard/knowledge/add/1",
    category: "1",
  },
  {
    id: 2,
    title: "Add Knowledge 2 -- Supervisory", 
    description: "Description 2",
    url: "/dashboard/knowledge/add/2",
    category: "2",
  },
  {
    id: 3,
    title: "Add Knowledge 3 -- Planning",
    description: "Description 3", 
    url: "/dashboard/knowledge/add/3",
    category: "3",
  },
  {
    id: 4,
    title: "Add Knowledge 4 -- Management",
    description: "Description 4",
    url: "/dashboard/knowledge/add/4", 
    category: "4",
  },
];

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default function AddKnowledge({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    slug: string[];
  } | null>(null);

  interface KnowledgeRow {
    id?: string | number;
    payload?: {
      page_content?: string;
      file_path?: string;
      uploaded_at?: string;
    };
  }

  const [knowledgeRows, setKnowledgeRows] = useState<KnowledgeRow[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidCategory, setIsValidCategory] = useState(true);
  const [editId, setEditId] = useState<string | number | undefined>(undefined);
  const [editContext, setEditContext] = useState<string>("");
  const [editFilePath, setEditFilePath] = useState<string>("");
  const [editUploadedAt, setEditUploadedAt] = useState<string>("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [sortConfig, setSortConfig] = useState<{ key: "file_path" | "uploaded_at" | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const handleSort = (key: "file_path" | "uploaded_at") => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectRow = (rowId: string | number, checked: boolean | "indeterminate") => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean | "indeterminate", rows: KnowledgeRow[]) => {
    if (checked) {
      const newSet = new Set<string | number>();
      rows.forEach((row, idx) => newSet.add(row.id ?? idx));
      setSelectedRows(newSet);
    } else {
      setSelectedRows(new Set());
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return knowledgeRows;
    const rowsCopy = [...knowledgeRows];
    rowsCopy.sort((a, b) => {
      const key = sortConfig.key as "file_path" | "uploaded_at";
      const aVal = (a.payload?.[key] ?? "") as string;
      const bVal = (b.payload?.[key] ?? "") as string;
      if (sortConfig.key === "uploaded_at") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return aDate - bDate;
      }
      return aVal.localeCompare(bVal);
    });
    if (sortConfig.direction === "desc") rowsCopy.reverse();
    return rowsCopy;
  }, [knowledgeRows, sortConfig]);

  const categoryLevel = resolvedParams?.slug?.[1];

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
      
      if (resolved?.slug?.[1]) {
        const categoryLevel = resolved.slug[1];
        const validCategories = ["1", "2", "3", "4"];
        if (!validCategories.includes(categoryLevel)) {
          setIsValidCategory(false);
        }
      }
    };

    resolveParams();
  }, [params]);

  const refreshKnowledge = async () => {
    if (!categoryLevel) return;
    try {
      setIsLoadingKnowledge(true);
      const response = await fetch(
        `http://localhost:8000/vectorstore/bejo-knowledge-level-${categoryLevel}`
      );
      const data = await response.json();
      console.log(data);
      setKnowledgeRows(data);
    } catch (error) {
      console.error("Error fetching knowledge:", error);
      setKnowledgeRows([]);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  useEffect(() => {
    if (categoryLevel) {
      refreshKnowledge();
    }
  }, [categoryLevel]);

  const handleDelete = async (id: string | number | undefined) => {
    if (!id) return;
    
    try {
      const isConfirmed = window.confirm("Are you sure you want to delete this item?");
      if (!isConfirmed) return;
      
      const response = await fetch(
        `http://localhost:8000/vectorstore/bejo-knowledge-level-${categoryLevel}?id=${id}`,
        {
          method: "DELETE",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success("Item berhasil dihapus");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Gagal menghapus item");
    }
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isValidCategory) {
    return notFound();
  }

  const slug = resolvedParams.slug;
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

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = sortedRows.slice(startIndex, endIndex);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    
    return pages;
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:8000/upload?category=${categoryLevel}&embed=true`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload gagal");
      }

      const data = await response.json();

      toast.success(`Yeay! ${data.message} with ${data.chunks_created} chunks created.`);

      // reload knowledge list
      await refreshKnowledge();

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload gagal");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (id: string | number | undefined) => {
    if (!id) return;

    try {
      const isConfirmed = window.confirm("Are you sure you want to edit this item?");
      if (!isConfirmed) return;
      
      const response = await fetch(
        `http://localhost:8000/vectorstore/bejo-knowledge-level-${categoryLevel}?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_content: editContext,
            file_path: editFilePath,
            uploaded_at: editUploadedAt,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to edit item");
      }

      toast.success("Item berhasil diubah");
      await refreshKnowledge();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Gagal mengubah item");
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-10 py-5">
        <DashboardHeader
          title={matched?.title.split(" -- ")[1] ?? "Knowledge Not Found"}
          breadcrumbs={breadcrumbs}
        />
        <div className="mt-7 space-y-4">
          <div className="flex justify-end">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setUploadDialogOpen(true)}>+ Add Knowledge</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Knowledge File</DialogTitle>
                  <DialogDescription>Choose a file to upload as knowledge.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".pdf,.docx,.pptx,.html,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp,.tiff"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    disabled={!uploadFile || isUploading}
                    onClick={async () => {
                      if (!uploadFile) return;
                      await handleUpload(uploadFile);
                      setUploadDialogOpen(false);
                      setUploadFile(null);
                    }}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="w-[40px] flex items-center">
                    <Checkbox
                      checked={
                        selectedRows.size === currentRows.length && currentRows.length > 0
                          ? true
                          : selectedRows.size > 0
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(value) => handleSelectAll(value as boolean, currentRows)}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[50px] flex items-center">No.</TableHead>
                  <TableHead className="w-[720px] flex items-center">Content</TableHead>
                  <TableHead
                    className="w-[240px] flex items-center cursor-pointer select-none"
                    onClick={() => handleSort("file_path")}
                  >
                    File Path
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </TableHead>
                  <TableHead
                    className="w-[240px] flex items-center cursor-pointer select-none"
                    onClick={() => handleSort("uploaded_at")}
                  >
                    Uploaded At
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </TableHead>
                  <TableHead className="w-[120px] flex items-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingKnowledge ? (
                  <TableRow className="flex">
                    <TableCell colSpan={12} className="col-span-12 text-center py-8">
                      <Loader2 className="animate-spin mx-auto mb-2" />
                      <p>Loading knowledge...</p>
                    </TableCell>
                  </TableRow>
                ) : currentRows.length > 0 ? (
                  currentRows.map((row, index) => (
                    <TableRow key={row.id || index} className="flex">
                      <TableCell className="w-[40px] flex items-center">
                         <Checkbox
                           checked={selectedRows.has(row.id ?? index)}
                           onCheckedChange={(value) =>
                             handleSelectRow(row.id ?? index, value as boolean)
                           }
                           aria-label="Select row"
                         />
                       </TableCell>
                       <TableCell className="w-[50px] font-medium flex items-center">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="w-[720px] flex items-start">
                        <div className="text-sm text-gray-700 truncate line-clamp-3 break-words">
                          {row.payload?.page_content}
                        </div>
                      </TableCell>
                      <TableCell className="w-[240px] flex items-start">
                        <div className="text-sm text-gray-700 truncate line-clamp-3 break-words">
                          {row.payload?.file_path}
                        </div>
                      </TableCell>
                      <TableCell className="w-[240px] flex items-start">
                        <div className="text-sm text-gray-700 truncate line-clamp-3 break-words">
                          {formatDateIndo(row.payload?.uploaded_at)}
                        </div>
                      </TableCell>
                        <TableCell className="w-[120px] flex items-center">
                        <div className="flex gap-1 w-full justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(row.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 " />
                          </Button>     
                          <Sheet
                              open={editId === row.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setEditId(row.id);
                                  setEditContext(row.payload?.page_content || "");
                                  setEditFilePath(row.payload?.file_path || "");
                                  setEditUploadedAt(row.payload?.uploaded_at || "");
                                } else {
                                  setEditId(undefined);
                                  setEditContext("");
                                  setEditFilePath("");
                                  setEditUploadedAt("");
                                }
                              }}
                            >
                              <SheetTrigger asChild>
                                <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Edit className="h-4 w-4 text-orange-500 " />
                            </Button> 
                            </SheetTrigger>
                            <SheetContent className="w-[600px]">
                              <SheetHeader>
                                <SheetTitle>Edit Knowledge</SheetTitle>
                                <SheetDescription>
                                  Edit the knowledge <strong>{row.id}</strong> here for make Context is more Precise.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                                <div className="grid gap-3">
                                  <Label htmlFor="context">Content</Label>
                                  <Textarea
                                      id="context"
                                      value={editId === row.id ? editContext : row.payload?.page_content}
                                      onChange={(e) => setEditContext(e.target.value)}
                                    />
                                    <Label htmlFor="file_path">File Path</Label>
                                    <Input
                                      id="file_path"
                                      value={editId === row.id ? editFilePath : row.payload?.file_path}
                                      onChange={(e) => setEditFilePath(e.target.value)}
                                      disabled
                                    />
                                    <Label htmlFor="uploaded_at">Uploaded At</Label>
                                    <Input
                                      id="uploaded_at"
                                      value={editId === row.id ? editUploadedAt : row.payload?.uploaded_at}
                                      onChange={(e) => setEditUploadedAt(e.target.value)}
                                      disabled
                                    />
                                </div>
                              </div>
                              <SheetFooter>
                                <Button type="button" onClick={() => handleEdit(row.id)}>Save changes</Button>
                                <SheetClose asChild>
                                  <Button variant="outline">Close</Button>
                                </SheetClose>
                              </SheetFooter>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="flex">
                    <TableCell colSpan={12} className="col-span-12 text-center py-8">
                      <p className="text-gray-500">No knowledge data available</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, knowledgeRows.length)} of {knowledgeRows.length} entries
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {generatePageNumbers().map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}