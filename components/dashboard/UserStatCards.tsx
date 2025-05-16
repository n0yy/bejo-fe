// File: components/dashboard/UserStatCards.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, LucideClockFading, UserCircle, Users2, X } from "lucide-react";

interface UserStat {
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  badge?: {
    label: string;
    icon: React.ReactNode;
    className: string;
  };
}

interface UserStatsCardsProps {
  stats: UserStat[];
}

export const UserStatCard = ({ stat }: { stat: UserStat }) => {
  return (
    <Card className="w-full sm:w-[300px] flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{stat.title}</span>
          {stat.badge ? (
            <Badge className={stat.badge.className}>
              {stat.badge.icon}
              {stat.badge.label}
            </Badge>
          ) : (
            stat.icon
          )}
        </CardTitle>
        <CardDescription>{stat.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end">
        <span className="text-4xl font-bold text-slate-800">{stat.count}</span>
        <Users2 className="text-slate-700 mb-0.5 ml-2" />
      </CardContent>
    </Card>
  );
};

export const UserStatsCards = ({ stats }: UserStatsCardsProps) => {
  return (
    <div className="mt-7 flex flex-wrap gap-5">
      {stats.map((stat, index) => (
        <UserStatCard key={index} stat={stat} />
      ))}
    </div>
  );
};

export default UserStatsCards;
