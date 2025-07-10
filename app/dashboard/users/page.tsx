import DashboardHeader from "@/components/dashboard/DashboardHeader";
import React from "react";
import { UsersTable } from "./users-table";
import { getAllUsers } from "@/lib/db/actions";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "User", isCurrentPage: true },
];

export default async function UserManagement() {
  const data = await getAllUsers();
  return (
    <div className="p-6 space-y-6">
      <DashboardHeader title="User Management" breadcrumbs={breadcrumbs} />
      <UsersTable initialData={data} />
    </div>
  );
}
