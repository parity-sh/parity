import {
  CheckCircleIcon,
  ClockIcon,
  RocketIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

interface Launch {
  id: string;
  name: string;
  symbol: string;
  status: "pending" | "active" | "migrated" | "failed";
  charityName: string | null;
  tokenMint: string | null;
  createdAt: Date;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: ClockIcon,
    className: "text-muted-foreground bg-muted",
  },
  active: {
    label: "Active",
    icon: RocketIcon,
    className: "text-primary bg-primary/10",
  },
  migrated: {
    label: "Migrated",
    icon: CheckCircleIcon,
    className: "text-primary bg-primary/10",
  },
  failed: {
    label: "Failed",
    icon: WarningIcon,
    className: "text-destructive bg-destructive/10",
  },
} as const;

export function LaunchCard({ launch }: { launch: Launch }) {
  const status = STATUS_CONFIG[launch.status];
  const StatusIcon = status.icon;

  return (
    <Link
      className="block border border-border bg-card p-4 transition-colors hover:border-muted-foreground"
      href={`/${launch.tokenMint ?? launch.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{launch.name}</h3>
            <span className="shrink-0 font-mono text-muted-foreground text-sm">
              ${launch.symbol}
            </span>
          </div>
          {launch.charityName && (
            <p className="mt-1 text-muted-foreground text-sm">
              {launch.charityName}
            </p>
          )}
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 px-2 py-1 text-xs ${status.className}`}
        >
          <StatusIcon className="size-3.5" weight="bold" />
          {status.label}
        </div>
      </div>
    </Link>
  );
}
