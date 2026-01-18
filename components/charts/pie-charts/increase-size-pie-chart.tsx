"use client";

import { LabelList, Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

// Sort the data by visitors in ascending order (smallest to largest) it will make graph look better
const sortedChartData = [...chartData].sort((a, b) => a.visitors - b.visitors);

// Configure the size increase between each pie ring
const BASE_RADIUS = 50; // Starting radius for the smallest pie
const SIZE_INCREMENT = 10; // How much to increase radius for each subsequent pie

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function IncreaseSizePieChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          Sized Pie Chart
          <Badge
            variant="outline"
            className="text-red-500 bg-red-500/10 border-none ml-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            {sortedChartData.map((entry, index) => (
              <Pie
                key={`pie-${index}`}
                data={[entry]}
                innerRadius={30}
                outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                dataKey="visitors"
                cornerRadius={4}
                startAngle={
                  // Calculate the percentage of total visitors up to current index
                  (sortedChartData
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.visitors, 0) /
                    sortedChartData.reduce((sum, d) => sum + d.visitors, 0)) *
                  360
                }
                endAngle={
                  // Calculate the percentage of total visitors up to and including current index
                  (sortedChartData
                    .slice(0, index + 1)
                    .reduce((sum, d) => sum + d.visitors, 0) /
                    sortedChartData.reduce((sum, d) => sum + d.visitors, 0)) *
                  360
                }
              >
                <Cell fill={entry.fill} />
                <LabelList
                  dataKey="visitors"
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
