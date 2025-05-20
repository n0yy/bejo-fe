import DashboardContent from "./DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "Dashboard Overview",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
