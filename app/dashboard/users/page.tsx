import DashboardHeader from "@/components/dashboard/DashboardHeader";
import React from "react";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "User", isCurrentPage: true },
];

export default function UserManagement() {
  return (
    <div className="py-7 px-4 md:px-10">
      <DashboardHeader title="Users Management" breadcrumbs={breadcrumbs} />
    </div>
  );
}
