"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { updateUserStatuses } from "@/lib/firebase/user";

interface DataTableProps {
  data: User[];
  onSuccess?: () => void;
}

export function DataTable({ data, onSuccess }: DataTableProps) {
  const [tableData, setTableData] = useState<User[]>(data);
  const [loading, setLoading] = useState<boolean>(false);
  const [changedItems, setChangedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTableData(data);
    setChangedItems({});
  }, [data]);

  const handleStatusChange = useCallback(
    (userId: string, newStatus: User["status"]) => {
      setTableData((currentTableData) =>
        currentTableData.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      const originalUser = data.find((user) => user.id === userId);
      if (originalUser) {
        const hasChanged = originalUser.status !== newStatus;
        setChangedItems((prevChanged) => {
          const updatedChanged = { ...prevChanged };
          if (hasChanged) {
            updatedChanged[userId] = true;
          } else {
            delete updatedChanged[userId];
          }
          return updatedChanged;
        });
      }
    },
    [data]
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const { name } = row.original;
          const seed = encodeURIComponent(name || "default");
          const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`;
          return (
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={name || "User Avatar"}
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
          const { id: userId, status } = row.original;

          const handleChange = (newStatusValue: string) => {
            handleStatusChange(userId, newStatusValue as User["status"]);
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
    ],
    [handleStatusChange]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const updates = Object.keys(changedItems).map((userId) => ({
        userId,
        status: tableData.find((user) => user.id === userId)!.status,
      }));
      await updateUserStatuses(updates);
      toast.success("Statuses updated successfully");
      setChangedItems({});
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to update statuses: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [changedItems, tableData, onSuccess]);

  const changeCount = Object.keys(changedItems).length;

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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="fixed bottom-10 right-10">
        <Button
          onClick={handleSave}
          className="hover:shadow hover:cursor-pointer"
          disabled={loading || changeCount === 0}
        >
          {loading
            ? "Saving..."
            : changeCount > 0
            ? `Save Changes (${changeCount})`
            : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
