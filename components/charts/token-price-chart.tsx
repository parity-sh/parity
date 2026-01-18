"use client";

import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PricePoint {
  time: string;
  price: number;
}

interface TokenPriceChartProps {
  data: PricePoint[];
  priceChange?: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function TokenPriceChart({
  data,
  priceChange = 0,
}: TokenPriceChartProps) {
  const isPositive = priceChange >= 0;
  const gradientId = `price-gradient-${Math.random().toString(36).slice(2)}`;
  const glowId = `price-glow-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="w-full">
      <ChartContainer className="h-[200px] w-full" config={chartConfig}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
            <filter height="140%" id={glowId} width="140%" x="-20%" y="-20%">
              <feGaussianBlur result="blur" stdDeviation="3" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <XAxis
            axisLine={false}
            dataKey="time"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            domain={["dataMin", "dataMax"]}
            tick={false}
            tickLine={false}
            width={0}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`$${Number(value).toFixed(6)}`, "Price"]}
              />
            }
            cursor={false}
          />
          <Area
            dataKey="price"
            fill={`url(#${gradientId})`}
            filter={`url(#${glowId})`}
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

// Generate mock price data for demo
export function generateMockPriceData(
  basePrice: number,
  points = 24
): PricePoint[] {
  const data: PricePoint[] = [];
  let price = basePrice;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48) * basePrice * 0.1;
    price = Math.max(0.000_001, price + change);
    data.push({
      time: `${i}h`,
      price,
    });
  }

  return data;
}
