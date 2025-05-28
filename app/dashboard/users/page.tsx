import DashboardHeader from "@/components/dashboard/DashboardHeader";
import React from "react";
import { DataTable } from "./data-table";
import { getUsers } from "@/lib/firebase/user";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "User", isCurrentPage: true },
];

export default async function UserManagement() {
  const data = await getUsers();
  console.log(data);
  return (
    <div className="p-6 space-y-6">
      <DashboardHeader title="User Management" breadcrumbs={breadcrumbs} />
      <DataTable data={data} />
    </div>
  );
}
