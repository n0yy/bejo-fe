"use client";

import React, { useState } from "react";
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
import { User } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { updateUserStatus } from "@/lib/firebase/user";

interface DataTableProps {
  data: User[];
  onSuccess?: () => void;
}

export function DataTable({ data, onSuccess }: DataTableProps) {
  const [tableData, setTableData] = useState<User[]>(data);
  const [loading, setLoading] = useState<boolean>(false);

  const updateStatus = (email: string, newStatus: User["status"]) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.email === email ? { ...item, status: newStatus } : item
      )
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const { name } = row.original;
        const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${name}`;

        return (
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={name}
              className="w-8 h-8 rounded-full border border-gray-200"
              loading="lazy"
            />
            <span>{name}</span>
          </div>
        );
      },
    },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "division", header: "Division" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const email = row.original.email;

        const handleChange = (newStatus: string) => {
          updateStatus(email, newStatus as User["status"]);
        };

        const statusColor =
          status === "approved"
            ? "bg-green-100 text-green-600"
            : status === "pending"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-red-100 text-red-600";

        return (
          <Select value={status} onValueChange={handleChange}>
            <SelectTrigger className={`w-28 ${statusColor}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const saveToFirestore = async () => {
    try {
      setLoading(true);
      const minimalData = tableData.map((user) => ({
        email: user.email,
        status: user.status,
      }));

      const result = await updateUserStatus(minimalData);

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error) {
      console.error("Error saving data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    toast.promise(
      saveToFirestore(),
      {
        loading: "Menyimpan perubahan...",
        success: (data) => `Berhasil memperbarui ${data.count} data pengguna!`,
        error: "Gagal menyimpan perubahan",
      },
      {
        duration: 4000,
        position: "top-center",
      }
    );
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="absolute bottom-10 right-10">
        <Button
          onClick={handleSave}
          className="hover:shadow hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Update"}
        </Button>
      </div>
    </div>
  );
}
