"use client";

import {
  CaretDown,
  CaretUp,
  CheckCircle,
  Clock,
  Rocket,
  User,
  Warning,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { getCharity } from "@/lib/charities";
import { cn } from "@/lib/utils";

type LaunchStatus = "pending" | "active" | "migrated" | "failed";

export interface TokenCardLaunch {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image: string | null;
  charityName: string | null;
  charityWallet: string;
  status: LaunchStatus;
  poolAddress: string | null;
  tokenMint: string | null;
  createdAt: Date;
  migratedAt: Date | null;
  creator?: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface TokenCardPriceData {
  spotPrice: number;
  poolLiquiditySol: number;
  totalSupply: number;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-muted-foreground bg-muted/20",
  },
  active: {
    label: "Live",
    icon: Rocket,
    className: "text-primary bg-primary/10",
  },
  migrated: {
    label: "Migrated",
    icon: CheckCircle,
    className: "text-[#FF8C3D] bg-[#FF8C3D]/10",
  },
  failed: {
    label: "Failed",
    icon: Warning,
    className: "text-destructive bg-destructive/10",
  },
} as const;

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toFixed(0);
}

function getStableMockChange(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    // Simple hash function without bitwise operators
    hash = hash * 31 + seed.charCodeAt(i);
    // Keep hash in safe integer range
    hash %= 2_147_483_647;
  }

  // Normalize to 0-1 range
  const normalized = Math.abs(hash) / 2_147_483_647;
  return (normalized - 0.4) * 20;
}

export interface TokenCardProps {
  launch: TokenCardLaunch;
  priceData?: TokenCardPriceData;
}

export function TokenCard({ launch, priceData }: TokenCardProps) {
  const status = STATUS_CONFIG[launch.status];
  const StatusIcon = status.icon;
  const isActive = launch.status === "active";
  const isMigrated = launch.status === "migrated";

  // Mock price change
  const priceChange = priceData ? getStableMockChange(launch.id) : 0;
  const isNeutral = Math.abs(priceChange) < 0.0001;
  const isPositive = priceChange >= 0;

  let priceChangeClassName = "text-muted-foreground/70";
  if (!isNeutral) {
    priceChangeClassName = isPositive ? "text-green-500" : "text-red-500";
  }

  let priceChangeIcon: React.ReactNode;
  if (isNeutral) {
    priceChangeIcon = (
      <span
        aria-hidden="true"
        className="block h-[2.5px] w-[8px] rounded-full bg-current"
      />
    );
  } else if (isPositive) {
    priceChangeIcon = <CaretUp size={10} weight="fill" />;
  } else {
    priceChangeIcon = <CaretDown size={10} weight="fill" />;
  }

  let priceChangeSrOnlyText = "No change";
  if (!isNeutral) {
    priceChangeSrOnlyText = isPositive ? "Up" : "Down";
  }

  const charity = launch.charityName
    ? getCharity(launch.charityName)
    : undefined;
  const marketCap = priceData ? priceData.spotPrice * priceData.totalSupply : 0;

  const content = (
    <>
      {/* Background Glow for Active/Migrated */}
      {(isActive || isMigrated) && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,140,61,0.08),transparent_70%)]" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {launch.image ? (
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted shadow-inner">
                <Image
                  alt={launch.name}
                  className="object-cover"
                  fill
                  src={launch.image}
                />
              </div>
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted shadow-inner">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {launch.symbol.slice(0, 2)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-sm transition-colors group-hover:text-primary">
                {launch.name}
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground">
                ${launch.symbol}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-bold text-[9px] uppercase tracking-wider",
              status.className
            )}
          >
            <StatusIcon className="size-2.5" weight="bold" />
            {status.label}
          </div>
        </div>

        <div className="mt-6 flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className="flex min-w-0 flex-col items-center">
                <span className="truncate font-bold font-mono text-lg leading-none tracking-tight">
                  ${formatCompactNumber(marketCap)}
                </span>
                <span className="mt-1 font-bold text-[9px] text-muted-foreground uppercase tracking-widest opacity-60">
                  Market Cap
                </span>
              </div>
              <div
                className={cn(
                  "flex shrink-0 items-center gap-0.5 font-bold font-mono text-[10px]",
                  priceChangeClassName
                )}
              >
                {priceChangeIcon}
                <span className="sr-only">{priceChangeSrOnlyText}</span>
                {Math.abs(priceChange).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-border/50 border-t bg-black/5 p-3">
        <div className="z-10 flex items-center gap-2">
          {launch.creator?.image ? (
            <div className="relative size-5 overflow-hidden rounded-full shadow-sm ring-1 ring-border/50">
              <Image
                alt={launch.creator.name}
                fill
                src={launch.creator.image}
              />
            </div>
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted shadow-sm ring-1 ring-border/50">
              <User className="text-muted-foreground" size={10} />
            </div>
          )}
          <span className="max-w-[80px] truncate font-medium text-[10px] text-muted-foreground">
            {launch.creator?.name || "Anonymous"}
          </span>
        </div>

        {launch.charityName && (
          <div className="flex items-center gap-1.5 text-primary drop-shadow-sm">
            <span className="font-bold text-[9px] uppercase tracking-wider">
              {launch.charityName}
            </span>
            {charity?.logoUrl && (
              <div className="relative size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/20">
                <Image
                  alt={`${charity.name} Logo`}
                  className="object-cover"
                  fill
                  src={charity.logoUrl}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const containerClassName = cn(
    "group relative flex flex-col overflow-hidden border border-border transition-all hover:border-foreground/20 hover:shadow-xl",
    isActive || isMigrated
      ? "bg-gradient-to-br from-[#FF8C3D]/5 to-[#FF8C3D]/15"
      : "bg-card"
  );

  return (
    <Link
      className={containerClassName}
      href={`/${launch.tokenMint ?? launch.id}`}
    >
      {content}
    </Link>
  );
}
