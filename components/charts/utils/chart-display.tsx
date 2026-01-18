import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/code-block/copy-button";
import React from "react";
import { ChartCodeSheet } from "./chart-code-sheet";
import { cn } from "@/lib/utils";

interface ChartDisplayProps {
  name: string;
  children: React.ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonContent?: any;
}

const ChartDisplay = ({
  name,
  children,
  className,
  jsonContent,
}: ChartDisplayProps) => {
  const code = jsonContent?.files[0].content;
  const fileName = jsonContent?.name;

  // if things are not present just dont showwwwe eeee yes lesgo
  if (!code || !fileName) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-border/40 p-1 rounded-[14px] group dark:shadow-md",
        className
      )}
    >
      <div className="pb-1.5 py-1 pl-3 pr-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium leading-none">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton code={code} />
          <ChartCodeSheet code={code} name={fileName}>
            <Button variant="outline" className="text-[11px] h-6 px-2">
              npx shadcn add
            </Button>
          </ChartCodeSheet>
        </div>
      </div>
      {children}
    </div>
  );
};

export default ChartDisplay;
