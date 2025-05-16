import DashboardHeader from "@/components/dashboard/DashboardHeader";
import React from "react";
import { DataTable } from "./data-table";
import { User } from "./columns";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "User", isCurrentPage: true },
];

async function getData(): Promise<User[]> {
  return [
    {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      email: "7E5b3@example.com",
      role: "admin",
      division: "IT",
      status: "approved",
    },
    {
      id: "2",
      name: "Jane Doe",
      username: "janedoe",
      email: "GhBk5@example.com",
      role: "user",
      division: "HR",
      status: "pending",
    },
    {
      id: "3",
      name: "Bob Smith",
      username: "bobsmith",
      email: "dM5Eg@example.com",
      role: "user",
      division: "Sales",
      status: "rejected",
    },
  ];
}

export default async function UserManagement() {
  const data = await getData();

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader title="User Management" breadcrumbs={breadcrumbs} />
      <DataTable data={data} />
    </div>
  );
}
