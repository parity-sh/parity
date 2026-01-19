"use client";

import {
  ArrowSquareOutIcon,
  CheckIcon,
  CoinsIcon,
  EyeIcon,
  GithubLogoIcon,
  HandshakeIcon,
  LockIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SquareHalfIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { FeeDistributionFlow } from "@/components/fee-distribution-flow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

function VerifiedBadge() {
  return (
    <div className="inline-flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
      <CheckIcon className="size-2.5" weight="bold" />
    </div>
  );
}

const STATS = [
  { label: "Total Launches", value: "127" },
  { label: "Volume (SOL)", value: "24,892" },
  { label: "Donated to Charity", value: "$321,300" },
  { label: "Active Traders", value: "3.2k" },
];

const VALUES = [
  {
    icon: EyeIcon,
    title: "Transparency",
    description:
      "Every fee path is visible on chain. Every contract is open source.",
  },
  {
    icon: HandshakeIcon,
    title: "Non-extractive",
    description:
      "The protocol takes less than the ecosystem. Creators get the upside.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Accountability",
    description:
      "Creators verify identity. Programs are immutable. No admin rugs.",
  },
  {
    icon: LockIcon,
    title: "Neutral ethics",
    description:
      "Charity is structural. No emotional manipulation. Fair by design.",
  },
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen p-6 md:p-10">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="mb-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,140,61,0.3)]">
            <SquareHalfIcon className="size-8" weight="bold" />
          </div>
          <div>
            <h1 className="font-bold text-3xl tracking-tighter md:text-5xl">
              PARITY
            </h1>
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Anti-Extraction Protocol
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="mb-6 font-semibold text-2xl leading-tight tracking-tight md:text-4xl">
            Token launches with <span className="text-primary">hard-coded</span>{" "}
            transparency and zero hidden extraction.
          </h2>
          <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
            An open, transparent bonding curve launch platform built on Solana.
            Every fee path is visible, fixed, and enforced on-chain forever.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {session?.user ? (
            <Button asChild className="h-12 px-8 text-base">
              <Link href="/create">
                <RocketLaunchIcon className="mr-2 size-5" weight="bold" />
                Launch a Token
              </Link>
            </Button>
          ) : (
            <Button asChild className="h-12 px-8 text-base">
              <Link href="/launches">
                <TrendUpIcon className="mr-2 size-5" weight="bold" />
                View Launches
              </Link>
            </Button>
          )}
          <Button asChild className="h-12 px-8 text-base" variant="outline">
            <a
              href="https://github.com/parity-labs/parity"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubLogoIcon className="mr-2 size-5" />
              GitHub
              <ArrowSquareOutIcon className="ml-1 size-3.5 opacity-50" />
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        {STATS.map((stat) => (
          <div
            className="bg-background p-6 transition-colors hover:bg-muted/50"
            key={stat.label}
          >
            <div className="mb-1 font-bold font-mono text-3xl text-primary tracking-tight">
              {stat.value}
            </div>
            <div className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Fee Distribution */}
      <FeeDistributionFlow />

      {/* Core Values */}
      <div className="mb-10">
        <h2 className="mb-4 font-semibold text-base tracking-tight">
          Core Values
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                className="flex gap-4 border border-border p-4"
                key={value.title}
              >
                <div className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
                  <Icon className="size-4 text-primary" weight="bold" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-sm">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works - Horizontal Timeline */}
      <div className="mb-10">
        <h2 className="mb-8 font-semibold text-base tracking-tight">
          How It Works
        </h2>
        <div className="relative">
          {/* Continuous horizontal line */}
          <div className="absolute top-4 left-[calc(16.67%)] h-px w-[calc(66.66%)] bg-gradient-to-r from-primary via-primary to-primary" />

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Launch",
                description:
                  "Creators launch tokens with a fixed bonding curve. Parameters are set once and enforced on chain.",
              },
              {
                step: "02",
                title: "Trade",
                description:
                  "Users buy and sell on the curve. Fees are displayed before every transaction.",
              },
              {
                step: "03",
                title: "Verify",
                description:
                  "All program IDs are public. Audit reports are linked. Creator verification is visible.",
              },
            ].map((item) => (
              <div className="flex flex-col items-center" key={item.step}>
                {/* Node */}
                <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[0_0_12px_rgba(255,140,61,0.4)]">
                  <div className="size-2.5 rounded-full bg-primary" />
                </div>

                {/* Card below */}
                <div className="mt-4 w-full rounded-xl border border-border bg-muted/20 p-4 text-center transition-all hover:border-primary/30 hover:bg-muted/30">
                  <span className="font-black font-mono text-primary text-xs">
                    [{item.step}]
                  </span>
                  <h3 className="mt-1 font-bold text-base tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Token */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-base tracking-tight">
            Platform Token
          </h2>
          <Badge className="border-primary text-primary" variant="outline">
            $DATABUDDY
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/20 p-6 ring-1 ring-border/50">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,140,61,0.2)]">
                <CoinsIcon className="size-5" weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight">
                    $DATABUDDY
                  </span>
                  <VerifiedBadge />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Platform Token
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contract</span>
                <a
                  className="font-mono text-primary text-xs hover:underline"
                  href="https://solscan.io/token/9XzKDJ9wP9yqi9G5okp9UFNxFuhqyk5GNyUnnBaRBAGS"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  9XzKDJ...BAGS
                </a>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-mono text-xs">Solana</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-6 ring-1 ring-border/50">
            <div className="mb-2 font-bold text-[10px] text-primary uppercase tracking-[0.15em]">
              On-Chain Transparency
            </div>
            <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
              All fees are visible and fixed. Nothing is hidden behind tooltips
              or fine print.
            </p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="font-bold font-mono text-primary text-sm">
                  15%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Platform
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-bold font-mono text-primary text-sm">
                  30%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Meteora
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-bold font-mono text-primary text-sm">
                  25%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Creator
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-bold font-mono text-primary text-sm">
                  30%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Charity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Parity Controls */}
      <div className="mb-10">
        <h2 className="mb-4 font-semibold text-base tracking-tight">
          What We Control
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border p-4">
            <div className="mb-2 text-muted-foreground text-xs">
              Fee Routing
            </div>
            <p className="text-sm">
              Parity enforces the 15/30/25/30 split. Fees are routed
              transparently to platform, Meteora, creator, and charity.
            </p>
          </div>
          <div className="border border-border p-4">
            <div className="mb-2 text-muted-foreground text-xs">
              Creator Verification
            </div>
            <p className="text-sm">
              We verify creator identity before launch. KYC status is visible on
              every token.
            </p>
          </div>
          <div className="border border-border p-4">
            <div className="mb-2 text-muted-foreground text-xs">
              Charity Enforcement
            </div>
            <p className="text-sm">
              30% to charity is structural, not optional. Charity wallets are
              verified and public.
            </p>
          </div>
        </div>
      </div>

      {/* Powered by Meteora */}
      <div className="mb-10 border border-border p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-sm">Powered by Meteora</span>
              <VerifiedBadge />
            </div>
            <p className="max-w-md text-muted-foreground text-sm">
              Token creation, bonding curves, and liquidity are handled by
              Meteora&apos;s audited on-chain programs. We don&apos;t deploy our
              own smart contracts.
            </p>
          </div>
          <a
            className="flex shrink-0 items-center gap-2 border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            href="https://meteora.ag"
            rel="noopener noreferrer"
            target="_blank"
          >
            Learn about Meteora
            <ArrowSquareOutIcon className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-border border-t pt-6 text-muted-foreground text-xs md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <SquareHalfIcon className="size-4" weight="bold" />
          <span>Open. Transparent. Fair.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Built on Solana</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Infrastructure by Meteora</span>
        </div>
      </div>
    </div>
  );
}
