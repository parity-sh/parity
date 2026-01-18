"use client";

import { PlusIcon, RocketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LaunchCard } from "@/components/launch-card";
import { useSession } from "@/lib/auth-client";
import { rpc } from "@/lib/rpc/client";

interface Launch {
  id: string;
  name: string;
  symbol: string;
  status: "pending" | "active" | "migrated" | "failed";
  curvePreset: "community" | "standard" | "scarce";
  charityName: string | null;
  createdAt: Date;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div className="h-20 animate-pulse bg-muted" key={i} />
      ))}
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="border border-destructive/20 bg-destructive/5 p-6">
      <p className="text-destructive text-sm">{error.message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-border bg-card p-12 text-center">
      <RocketIcon
        className="mx-auto size-12 text-muted-foreground"
        weight="duotone"
      />
      <p className="mt-4 font-medium">No launches yet</p>
      <p className="mt-1 text-muted-foreground text-sm">
        Create your first token launch.
      </p>
      <Link
        className="mt-6 inline-flex h-10 items-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
        href="/create"
      >
        <PlusIcon className="size-4" weight="bold" />
        Create Launch
      </Link>
    </div>
  );
}

function LaunchList({ launches }: { launches: Launch[] }) {
  return (
    <div className="space-y-3">
      {launches.map((launch) => (
        <LaunchCard key={launch.id} launch={launch} />
      ))}
    </div>
  );
}

function LaunchesContent({
  isLoading,
  error,
  launches,
}: {
  isLoading: boolean;
  error: Error | null;
  launches: Launch[];
}) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  if (launches.length === 0) {
    return <EmptyState />;
  }
  return <LaunchList launches={launches} />;
}

export default function LaunchesPage() {
  const { data: session, isPending: isSessionLoading } = useSession();

  const {
    data: launches,
    isLoading: isLaunchesLoading,
    error,
  } = useQuery({
    queryKey: ["launches"],
    queryFn: () => rpc.launch.list(),
    enabled: !!session?.user,
  });

  const isLoading = isSessionLoading || isLaunchesLoading;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-medium text-2xl">Launches</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Manage your token launches.
          </p>
        </div>
        <Link
          className="flex h-9 items-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href="/create"
        >
          <PlusIcon className="size-4" weight="bold" />
          New
        </Link>
      </div>

      <LaunchesContent
        error={error as Error | null}
        isLoading={isLoading}
        launches={(launches ?? []) as Launch[]}
      />
    </div>
  );
}
