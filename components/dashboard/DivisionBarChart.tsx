import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-3))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export default function DivisionBarChart({
  data,
  title,
  description,
}: {
  data: any;
  title: string;
  description: string;
}) {
  const topDivision = data.reduce(
    (prev: { count: number }, current: { count: number }) =>
      current.count > prev.count ? current : prev
  );

  const lowestDivision = data.reduce(
    (prev: { count: number }, current: { count: number }) =>
      current.count < prev.count ? current : prev
  );

  return (
    <Card className="mt-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 10, left: 80 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="division"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={10}
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="count"
                layout="vertical"
                fill="var(--color-count)"
                radius={4}
                barSize={50}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-between text-sm">
        <div className="flex space-x-1 items-center">
          <Badge className="flex space-x-1 items-center text-green-500 bg-green-100">
            <TrendingUp size={14} />
            <span className="text-xs font-medium">Highest</span>
          </Badge>
          <span className="text-xs text-slate-500">
            {topDivision.count} users from {topDivision.division}
          </span>
        </div>
        <div className="flex space-x-1 items-center">
          <Badge className="flex space-x-1 items-center text-red-500 bg-red-100">
            <TrendingDown size={14} />
            <span className="text-xs font-medium">Lowest</span>
          </Badge>
          <span className="text-xs text-slate-500">
            {lowestDivision.count} users from {lowestDivision.division}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
