// File: app/dashboard/page.tsx
"use client";

import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { UserStatsCards } from "@/components/dashboard/UserStatCards";
import DivisionBarChart from "@/components/dashboard/DivisionBarChart";
import { Check, LucideClockFading, UserCircle, X } from "lucide-react";

// Demo data for users statistics
const userStats = [
  {
    title: "Approved Users",
    count: 121,
    description: "Users who passed the verification process",
    icon: <UserCircle size={22} />,
    badge: {
      label: "Approved",
      icon: <Check size={16} className="mr-1" />,
      className: "bg-green-100 text-green-700 flex items-center gap-1",
    },
  },
  {
    title: "Pending Users",
    count: 18,
    description: "Users waiting for approval",
    icon: <UserCircle size={22} />,
    badge: {
      label: "Pending",
      icon: <LucideClockFading size={16} className="mr-1" />,
      className: "bg-yellow-100 text-yellow-700 flex items-center gap-1",
    },
  },
  {
    title: "Rejected Users",
    count: 2,
    description: "Users who failed verification",
    icon: <UserCircle size={22} />,
    badge: {
      label: "Rejected",
      icon: <X size={16} className="mr-1" />,
      className: "bg-red-100 text-red-700 flex items-center gap-1",
    },
  },
  {
    title: "Total Users",
    count: 141,
    description: "All users registered on the platform",
    icon: <UserCircle size={20} />,
  },
];

// Enhanced division data with more metrics
const divisionDat = [
  {
    division: "Engineering",
    count: 23,
  },
  {
    division: "MD",
    count: 12,
  },
  {
    division: "QA",
    count: 31,
  },
  {
    division: "QC",
    count: 8,
  },
  {
    division: "HR",
    count: 2,
  },
  {
    division: "Technical",
    count: 65,
  },
];

// Dashboard breadcrumbs
const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", isCurrentPage: true },
];

export default function Dashboard() {
  return (
    <div className="py-7 px-4 md:px-10">
      <DashboardHeader title="Overview" breadcrumbs={breadcrumbs} />

      <UserStatsCards stats={userStats} />

      <DivisionBarChart
        data={divisionDat}
        title="Division User Distribution"
        description="Interactive view of user distribution across departments with activity metrics"
      />
    </div>
  );
}
