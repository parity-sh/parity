"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function PingingDotChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pinging Dot Chart
          <Badge
            className="ml-2 border-none bg-green-500/10 text-green-500"
            variant="outline"
          >
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Line
              dataKey="desktop"
              dot={<CustomizedDot />}
              stroke="var(--color-desktop)"
              strokeDasharray="4 4"
              type="linear"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomizedDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx, cy, stroke } = props;

  return (
    <g>
      {/* Main dot */}
      <circle cx={cx} cy={cy} fill={stroke} r={3} />
      {/* Ping animation circles */}
      <circle
        cx={cx}
        cy={cy}
        fill="none"
        opacity="0.8"
        r={3}
        stroke={stroke}
        strokeWidth="1"
      >
        <animate
          attributeName="r"
          dur="1s"
          repeatCount="indefinite"
          values="3;10"
        />
        <animate
          attributeName="opacity"
          dur="1s"
          repeatCount="indefinite"
          values="0.8;0"
        />
      </circle>
    </g>
  );
};
