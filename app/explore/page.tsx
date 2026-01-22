"use client";

import {
  CaretDown,
  CaretUp,
  MagnifyingGlass,
  Warning,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TokenCard,
  type TokenCardLaunch,
  type TokenCardPriceData,
} from "@/components/token-card";
import { getErrorMessage } from "@/lib/error-utils";
import { rpc } from "@/lib/rpc/client";
import { cn } from "@/lib/utils";

type LaunchStatus = "pending" | "active" | "migrated" | "failed";

export default function ExplorePage() {
  const [statusFilter, setStatusFilter] = useState<LaunchStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "marketCap">("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const poolAddresses = useMemo(
    () =>
      launches
        ?.filter((l) => l.status === "active" && l.poolAddress)
        .map((l) => l.poolAddress as string) ?? [],
    [launches]
  );

  const { data: pricesData } = useQuery({
    queryKey: ["pool-prices", poolAddresses],
    queryFn: () => rpc.pool.prices({ poolAddresses }),
    enabled: poolAddresses.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const priceMap = useMemo(() => {
    const map = new Map<string, TokenCardPriceData>();
    if (pricesData) {
      for (const item of pricesData) {
        if (item.data) {
          map.set(item.poolAddress, item.data);
        }
      }
    }
    return map;
  }, [pricesData]);

  const sortedLaunches = useMemo(() => {
    if (!launches) {
      return [];
    }

    const result = [...launches];

    if (sortBy === "marketCap") {
      result.sort((a, b) => {
        const mcA = a.poolAddress
          ? (priceMap.get(a.poolAddress)?.spotPrice ?? 0) *
            (priceMap.get(a.poolAddress)?.totalSupply ?? 0)
          : 0;
        const mcB = b.poolAddress
          ? (priceMap.get(b.poolAddress)?.spotPrice ?? 0) *
            (priceMap.get(b.poolAddress)?.totalSupply ?? 0)
          : 0;
        return sortOrder === "desc" ? mcB - mcA : mcA - mcB;
      });
    } else {
      // Sort in-place for recency (createdAt)
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
    }

    return result;
  }, [launches, sortBy, sortOrder, priceMap]);

  const handleSortToggle = (newSort: "recent" | "marketCap") => {
    if (newSort === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
      return;
    }

    setSortBy(newSort);
    setSortOrder("desc");
  };

  const CaretIcon = sortOrder === "desc" ? CaretDown : CaretUp;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="font-semibold text-3xl tracking-tight">Explore</h1>
            <p className="font-medium text-muted-foreground">
              Discover tokens launched on Parity
            </p>
          </div>

          <div className="flex w-fit rounded-lg bg-muted p-1">
            {(["all", "active", "pending", "migrated"] as const).map((s) => (
              <button
                className={cn(
                  "px-4 py-1.5 font-bold text-xs uppercase tracking-wider transition-all",
                  statusFilter === s
                    ? "rounded-md bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                key={s}
                onClick={() => setStatusFilter(s)}
                type="button"
              >
                {(() => {
                  if (s === "all") {
                    return "All";
                  }
                  if (s === "active") {
                    return "Live";
                  }
                  return s.charAt(0).toUpperCase() + s.slice(1);
                })()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex rounded-lg bg-muted p-1">
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 font-bold text-xs uppercase tracking-wider transition-all",
              sortBy === "recent"
                ? "rounded-md bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleSortToggle("recent")}
            type="button"
          >
            Recently
            <CaretIcon
              className={cn(
                "transition-transform",
                sortBy !== "recent" && "opacity-40"
              )}
              size={14}
              weight="bold"
            />
          </button>
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 font-bold text-xs uppercase tracking-wider transition-all",
              sortBy === "marketCap"
                ? "rounded-md bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleSortToggle("marketCap")}
            type="button"
          >
            Market Cap
            <CaretIcon
              className={cn(
                "transition-transform",
                sortBy !== "marketCap" && "opacity-40"
              )}
              size={14}
              weight="bold"
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [1, 2, 3, 4, 5].map((i) => (
            <div className="h-56 animate-pulse rounded-xl bg-muted" key={i} />
          ))}
        {!isLoading && error && (
          <div className="col-span-full rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
            <Warning
              className="mx-auto size-16 text-destructive"
              weight="duotone"
            />
            <p className="mt-4 font-bold text-destructive">
              Failed to load launches
            </p>
            <p className="mt-1 text-destructive/70 text-sm">
              {getErrorMessage(error)}
            </p>
          </div>
        )}
        {!(isLoading || error) && sortedLaunches.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-muted border-dashed py-20 text-center">
            <MagnifyingGlass
              className="mx-auto size-16 text-muted-foreground"
              weight="duotone"
            />
            <p className="mt-4 font-bold text-lg">No launches found</p>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or be the first to launch!
            </p>
            <Link
              className="mt-8 inline-flex h-10 items-center gap-2 bg-primary px-6 font-bold text-primary-foreground text-sm uppercase tracking-wider hover:opacity-90"
              href="/create"
            >
              Create Launch
            </Link>
          </div>
        )}
        {!(isLoading || error) &&
          sortedLaunches.length > 0 &&
          sortedLaunches.map((launch) => (
            <TokenCard
              key={launch.id}
              launch={launch as TokenCardLaunch}
              priceData={
                launch.poolAddress
                  ? priceMap.get(launch.poolAddress)
                  : undefined
              }
            />
          ))}
      </div>
    </div>
  );
}
