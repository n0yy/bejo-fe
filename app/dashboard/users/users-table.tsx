"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import Image from "next/image";

interface UsersTableProps {
  initialData: User[];
}

const STATUS_OPTIONS = [
  {
    value: "approved",
    label: "Approved",
    className: "bg-green-100 text-green-600",
  },
  {
    value: "pending",
    label: "Pending",
    className: "bg-yellow-100 text-yellow-600",
  },
  {
    value: "rejected",
    label: "Rejected",
    className: "bg-red-100 text-red-600",
  },
];

const CATEGORY_OPTIONS = [
  { value: "1", label: "Level 1 - Control & Field" },
  { value: "2", label: "Level 2 - Supervisory" },
  { value: "3", label: "Level 3 - Planning" },
  { value: "4", label: "Level 4 - Management" },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export function UsersTable({ initialData }: UsersTableProps) {
  const [tableData, setTableData] = useState<User[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

  useEffect(() => {
    setTableData(initialData);
    setChangedItems(new Set());
  }, [initialData]);

  const handleFieldChange = useCallback(
    (userId: string, field: keyof User, newValue: any) => {
      const originalUser = initialData.find((user) => user.id === userId);
      if (!originalUser) return;

      setTableData((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, [field]: newValue } : user
        )
      );

      setChangedItems((prev) => {
        const newSet = new Set(prev);
        if (originalUser[field] !== newValue) {
          newSet.add(userId);
        } else {
          const currentUser = {
            ...tableData.find((u) => u.id === userId),
            [field]: newValue,
          };
          const hasOtherChanges =
            currentUser &&
            (originalUser.status !== currentUser.status ||
              originalUser.category !== currentUser.category ||
              originalUser.role !== currentUser.role);

          if (!hasOtherChanges) {
            newSet.delete(userId);
          }
        }
        return newSet;
      });
    },
    [initialData, tableData]
  );

  const canEditRole = useMemo(() => {
    if (!session?.user) return false;
    return session.user.role === "admin" && session.user.category === "4";
  }, [session?.user]);

  // Fungsi untuk update via API route
  const handleSave = useCallback(async () => {
    if (changedItems.size === 0) return;

    setLoading(true);
    try {
      const updates = Array.from(changedItems).map((userId) => {
        const updatedUser = tableData.find((user) => user.id === userId)!;
        return {
          userId,
          status: updatedUser.status,
          category: updatedUser.category,
          role: updatedUser.role,
        };
      });

      // Panggil API route (bukan server action langsung)
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Gagal update pengguna");
      }

      const result = await response.json();
      toast.success(`Berhasil update ${updates.length} pengguna`);
      setChangedItems(new Set());

      // Refresh data jika diperlukan
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Gagal update: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [changedItems, tableData]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => {
          const { name } = row.original;
          const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
            name || "default"
          )}`;
          return (
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src={avatarUrl}
                alt={name || "User Avatar"}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-200"
                loading="lazy"
                width={50}
                height={50}
              />
              <span className="text-sm sm:text-base">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm sm:text-base hidden md:table-cell">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          return canEditRole ? (
            <Select
              value={row.original.role}
              onValueChange={(value) =>
                handleFieldChange(row.original.id, "role", value)
              }
            >
              <SelectTrigger className="w-24 sm:w-28 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm sm:text-base">{row.original.role}</span>
          );
        },
      },
      {
        accessorKey: "division",
        header: "Divisi",
        cell: ({ row }) => (
          <span className="text-sm sm:text-base hidden lg:table-cell">
            {row.original.division}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const { id: userId, status } = row.original;
          const statusOption = STATUS_OPTIONS.find(
            (opt) => opt.value === status
          );

          return (
            <Select
              value={status}
              onValueChange={(value) =>
                handleFieldChange(userId, "status", value)
              }
            >
              <SelectTrigger
                className={`w-24 sm:w-28 text-xs sm:text-sm ${
                  statusOption?.className || ""
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Level Kategori",
        cell: ({ row }) => {
          const { id: userId, category } = row.original;

          return (
            <Select
              value={category}
              onValueChange={(value) =>
                handleFieldChange(userId, "category", value)
              }
            >
              <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
    ],
    [handleFieldChange, canEditRole]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Debug: Role={session?.user?.role}, Category=
          {session?.user?.category}, CanEditRole={canEditRole}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs sm:text-sm font-medium p-2 sm:p-3"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="text-xs sm:text-sm">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2 sm:p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {changedItems.size > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="shadow-lg hover:shadow-xl transition-shadow text-xs sm:text-sm px-3 sm:px-4"
          >
            {loading
              ? "Menyimpan..."
              : `Simpan Perubahan (${changedItems.size})`}
          </Button>
        </div>
      )}
    </div>
  );
}
