import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
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
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="Division"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
              <LabelList
                dataKey="Division"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="Count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2 items-center">
          <Badge className="flex space-x-1 items-center text-green-500 bg-green-100">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Highest</span>
          </Badge>
          <span className="text-sm text-slate-500">
            {topDivision.count} users from {topDivision.division}
          </span>
        </div>
        <div className="flex space-x-2 items-center">
          <Badge className="flex space-x-1 items-center text-red-500 bg-red-100">
            <TrendingDown size={16} />
            <span className="text-sm font-medium">Lowest</span>
          </Badge>
          <span className="text-sm text-slate-500">
            {lowestDivision.count} users from {lowestDivision.division}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
