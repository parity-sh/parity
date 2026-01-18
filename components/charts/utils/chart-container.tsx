import { cn } from "@/lib/utils";
import React from "react";

const DisplayChartContainer = ({
  count = 2,
  className,
  children,
}: {
  count?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={
        {
          "--chart-count": count,
        } as React.CSSProperties
      }
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-[repeat(var(--chart-count),minmax(0,1fr))]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default DisplayChartContainer;
