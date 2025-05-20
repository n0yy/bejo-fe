"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { UserStatsCards } from "@/components/dashboard/UserStatCards";
import DivisionBarChart from "@/components/dashboard/DivisionBarChart";
import { Check, LucideClockFading, UserCircle, X } from "lucide-react";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", isCurrentPage: true },
];

export default function DashboardContent() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user/get-all");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const userStats = useMemo(() => {
    const statuses = ["approved", "pending", "rejected"];
    return [
      ...statuses.map((status) => ({
        title: `${status.charAt(0).toUpperCase() + status.slice(1)} Users`,
        count: users.filter((u) => u.status === status).length,
        description: `Users who are ${status}`,
        icon: <UserCircle size={20} />,
        badge: {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          icon:
            status === "approved" ? (
              <Check size={14} className="mr-1" />
            ) : status === "pending" ? (
              <LucideClockFading size={14} className="mr-1" />
            ) : (
              <X size={14} className="mr-1" />
            ),
          className:
            status === "approved"
              ? "bg-green-100 text-green-700 flex items-center gap-1"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-700 flex items-center gap-1"
              : "bg-red-100 text-red-700 flex items-center gap-1",
        },
      })),
      {
        title: "Total Users",
        count: users.length,
        description: "All registered users",
        icon: <UserCircle size={18} />,
      },
    ];
  }, [users]);

  const divisionDat = useMemo(() => {
    const divisions = [
      "Engineering",
      "Technical Service",
      "QA/QC",
      "Manufacturing Development",
      "HR",
    ];

    return divisions.map((division) => ({
      division,
      count: users.filter((u) => u.division === division).length,
    }));
  }, [users]);

  return (
    <div className="py-4 px-2 sm:px-6">
      <DashboardHeader title="Overview" breadcrumbs={breadcrumbs} />
      <UserStatsCards stats={userStats} />
      <DivisionBarChart
        data={divisionDat}
        title="Division User Distribution"
        description="User distribution across departments"
      />
    </div>
  );
}
