import { ArrowSquareOutIcon, ShuffleIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHARITIES } from "@/lib/charities";
import { cn } from "@/lib/utils";

interface CharitySelectProps {
  value: string;
  onChange: (value: string, name?: string) => void;
  error?: string;
  className?: string;
}

export function CharitySelect({
  value,
  onChange,
  error,
  className,
}: CharitySelectProps) {
  const handleSelectChange = (newValue: string) => {
    const charity = CHARITIES.find((c) => c.address === newValue);
    if (charity) {
      onChange(charity.address, charity.name);
    } else {
      console.error(`Charity not found: ${newValue}`);
      onChange(newValue);
    }
  };

  const selectedCharity = CHARITIES.find((c) => c.address === value);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="m-1.5 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Charity
          </Label>
          {error ? (
            <span className="slide-in-from-right-1 animate-in font-medium text-destructive/90 text-xs">
              {error}
            </span>
          ) : (
            selectedCharity &&
            selectedCharity.address !== "random" && (
              <a
                className="group fade-in flex animate-in items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
                href={`https://solscan.io/account/${selectedCharity.address}`}
                rel="noreferrer"
                target="_blank"
              >
                Verify on Solscan
                <ArrowSquareOutIcon className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )
          )}
        </div>
        <Select onValueChange={handleSelectChange} value={value}>
          <SelectTrigger
            className={cn(
              "h-auto min-h-14 w-full py-4",
              error && "border-destructive/50 focus-visible:ring-destructive/20"
            )}
          >
            <SelectValue placeholder="Choose a cause to support" />
          </SelectTrigger>
          <SelectContent>
            {CHARITIES.map((charity) => (
              <SelectItem key={charity.address} value={charity.address}>
                <div className="flex flex-col items-start gap-0.5 py-1">
                  <span className="flex items-center gap-2 font-medium">
                    {charity.name}
                    {charity.address === "random" && (
                      <ShuffleIcon className="size-3.5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {charity.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show Address if a specific charity is selected (not random) */}
      {selectedCharity && selectedCharity.address !== "random" && (
        <div className="fade-in slide-in-from-top-1 animate-in rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono">{selectedCharity.address}</span>
          </div>
        </div>
      )}
    </div>
  );
}
