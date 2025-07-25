import DashboardHeader from "@/components/dashboard/DashboardHeader";
import React, { Suspense } from "react";
import { UsersTable } from "./users-table";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "User", isCurrentPage: true },
];

export default async function UserManagement() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users`, {
    cache: "no-store",
  });
  const data = await response.json();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-6 space-y-6">
        <DashboardHeader title="User Management" breadcrumbs={breadcrumbs} />
        <UsersTable initialData={data} />
      </div>
    </Suspense>
  );
}
