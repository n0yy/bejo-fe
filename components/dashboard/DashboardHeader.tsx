// File: components/dashboard/DashboardHeader.tsx
"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BarChart3, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface DashboardHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

export const DashboardHeader = ({
  title,
  breadcrumbs,
}: DashboardHeaderProps) => {
  return (
    <header>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href || "#"}>
                    {index === 0 ? (
                      <span className="flex items-center">
                        <Home className="h-3.5 w-3.5 mr-1" />
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center mt-4">
        <BarChart3 className="mr-2 h-7 w-7 text-primary" />
        <h1 className="font-bold text-3xl md:text-4xl">{title}</h1>
      </div>
    </header>
  );
};

export default DashboardHeader;
