"use client";

import {
  CheckCircle,
  Clock,
  MagnifyingGlass,
  Rocket,
  TrendDown,
  TrendUp,
  Warning,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { rpc } from "@/lib/rpc/client";
import { cn } from "@/lib/utils";

type LaunchStatus = "pending" | "active" | "migrated" | "failed";

interface Launch {
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
}

interface PriceData {
  poolAddress: string;
  data: {
    spotPrice: number;
    poolLiquiditySol: number;
  } | null;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-muted-foreground",
  },
  active: { label: "Live", icon: Rocket, className: "text-primary" },
  migrated: {
    label: "Migrated",
    icon: CheckCircle,
    className: "text-primary/70",
  },
  failed: { label: "Failed", icon: Warning, className: "text-destructive" },
} as const;

function formatPrice(price: number): string {
  if (price === 0) {
    return "$0.00";
  }
  if (price < 0.000_001) {
    return `$${price.toExponential(2)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
}

function formatSol(sol: number): string {
  if (sol < 1) {
    return `${sol.toFixed(2)}`;
  }
  if (sol < 100) {
    return `${sol.toFixed(1)}`;
  }
  return sol.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div className="h-40 animate-pulse bg-muted" key={i} />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="py-20 text-center">
      <MagnifyingGlass
        className="mx-auto size-16 text-muted-foreground"
        weight="duotone"
      />
      <p className="mt-4 font-medium text-lg">
        {hasFilter ? "No launches match your filter" : "No launches yet"}
      </p>
      <p className="mt-2 text-muted-foreground">
        {hasFilter
          ? "Try adjusting your filter criteria."
          : "Be the first to create a token launch."}
      </p>
      {!hasFilter && (
        <Link
          className="mt-6 inline-flex h-10 items-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm hover:opacity-90"
          href="/create"
        >
          Create Launch
        </Link>
      )}
    </div>
  );
}

function StatusFilter({
  value,
  onChange,
}: {
  value: LaunchStatus | "all";
  onChange: (status: LaunchStatus | "all") => void;
}) {
  const statuses: Array<{ value: LaunchStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Live" },
    { value: "pending", label: "Pending" },
    { value: "migrated", label: "Migrated" },
  ];

  return (
    <div className="flex gap-1">
      {statuses.map((status) => (
        <button
          className={cn(
            "px-4 py-2 font-medium text-sm transition-colors",
            value === status.value
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          key={status.value}
          onClick={() => onChange(status.value)}
          type="button"
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

function TokenCard({
  launch,
  priceData,
}: {
  launch: Launch;
  priceData?: PriceData["data"];
}) {
  const status = STATUS_CONFIG[launch.status];
  const StatusIcon = status.icon;
  const isActive = launch.status === "active";

  // Mock price change (would be real in production)
  const priceChange = priceData ? (Math.random() - 0.4) * 20 : 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      className="group block border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
      href={`/${launch.tokenMint ?? launch.id}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        {/* Token Image */}
        {launch.image ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image
              alt={launch.name}
              className="object-cover"
              fill
              src={launch.image}
            />
          </div>
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
            <span className="font-mono text-lg text-muted-foreground">
              {launch.symbol.slice(0, 2)}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-lg group-hover:text-primary">
                {launch.name}
              </h3>
              <p className="font-mono text-muted-foreground">
                ${launch.symbol}
              </p>
            </div>
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-sm",
                status.className
              )}
            >
              <StatusIcon className="size-4" weight="bold" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price & Stats */}
      {isActive && priceData ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="font-mono font-semibold text-2xl">
              {formatPrice(priceData.spotPrice)}
            </span>
            <div
              className={cn(
                "flex items-center gap-1 font-mono text-sm",
                isPositive ? "text-primary" : "text-destructive"
              )}
            >
              {isPositive ? (
                <TrendUp className="size-4" weight="bold" />
              ) : (
                <TrendDown className="size-4" weight="bold" />
              )}
              {Math.abs(priceChange).toFixed(1)}%
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span>Liquidity</span>
            <span className="font-mono">
              {formatSol(priceData.poolLiquiditySol)} SOL
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center text-muted-foreground text-sm">
          {launch.status === "pending" ? "Awaiting deployment" : "—"}
        </div>
      )}

      {/* Charity */}
      {launch.charityName && (
        <div className="mt-4 truncate border-border border-t pt-3 text-muted-foreground text-sm">
          Benefiting: {launch.charityName}
        </div>
      )}
    </Link>
  );
}

export default function ExplorePage() {
  const [statusFilter, setStatusFilter] = useState<LaunchStatus | "all">("all");

  const {
    data: launches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["launches", "all", statusFilter],
    queryFn: () =>
      rpc.launch.listAll({
        limit: 50,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const poolAddresses =
    launches
      ?.filter((l) => l.status === "active" && l.poolAddress)
      .map((l) => l.poolAddress as string) ?? [];

  const { data: pricesData } = useQuery({
    queryKey: ["pool-prices", poolAddresses],
    queryFn: () => rpc.pool.prices({ poolAddresses }),
    enabled: poolAddresses.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const priceMap = new Map<string, PriceData["data"]>();
  if (pricesData) {
    for (const item of pricesData) {
      priceMap.set(item.poolAddress, item.data);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight">Explore</h1>
          <p className="mt-1 text-muted-foreground">
            Discover tokens launched on Parity
          </p>
        </div>
        {pricesData && pricesData.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            Live prices
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <StatusFilter onChange={setStatusFilter} value={statusFilter} />
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {!isLoading && error && (
        <div className="border border-destructive/20 bg-destructive/5 p-8 text-center">
          <Warning
            className="mx-auto size-12 text-destructive"
            weight="duotone"
          />
          <p className="mt-4 text-destructive">
            {error instanceof Error ? error.message : "Failed to load launches"}
          </p>
        </div>
      )}

      {!(isLoading || error) && (!launches || launches.length === 0) && (
        <EmptyState hasFilter={statusFilter !== "all"} />
      )}

      {!(isLoading || error) && launches && launches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(launches as Launch[]).map((launch) => (
            <TokenCard
              key={launch.id}
              launch={launch}
              priceData={
                launch.poolAddress
                  ? (priceMap.get(launch.poolAddress) ?? undefined)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
