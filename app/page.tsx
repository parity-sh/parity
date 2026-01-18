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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

function VerifiedBadge() {
  return (
    <div className="inline-flex size-4 items-center justify-center border border-primary">
      <CheckIcon className="size-2.5 text-primary" weight="bold" />
    </div>
  );
}

const STATS = [
  { label: "Total Launches", value: "127" },
  { label: "Volume (SOL)", value: "24,892" },
  { label: "Donated to Charity", value: "2,142 SOL" },
  { label: "Active Traders", value: "3.2k" },
];

const FEE_BREAKDOWN = [
  { label: "Platform", value: "15%", description: "Max cap enforced on-chain" },
  { label: "Meteora", value: "30%", description: "Liquidity infrastructure" },
  { label: "Creator", value: "25%", description: "Direct to verified wallet" },
  { label: "Charity", value: "30%", description: "Structural, not optional" },
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
    <div className="min-h-screen p-6 md:p-8">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center bg-primary">
            <SquareHalfIcon
              className="size-6 text-primary-foreground"
              weight="bold"
            />
          </div>
          <div>
            <h1 className="font-semibold text-xl tracking-tight">
              Welcome to Parity
            </h1>
            <p className="text-muted-foreground text-sm">
              Token launches without extraction
            </p>
          </div>
        </div>

        <p className="mb-6 max-w-xl text-muted-foreground leading-relaxed">
          An open, transparent bonding curve launch platform built on Solana.
          Fees are visible, fixed, and enforced on chain.
        </p>

        <div className="flex flex-wrap gap-3">
          {session?.user ? (
            <Button asChild>
              <Link href="/create">
                <RocketLaunchIcon className="mr-2 size-4" weight="bold" />
                Launch a Token
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/launches">
                <TrendUpIcon className="mr-2 size-4" weight="bold" />
                View Launches
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <a
              href="https://github.com/parity-labs/parity"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubLogoIcon className="mr-2 size-4" />
              GitHub
              <ArrowSquareOutIcon className="ml-1 size-3 opacity-50" />
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((stat) => (
          <div className="border border-border p-4" key={stat.label}>
            <div className="mb-1 font-mono text-2xl">{stat.value}</div>
            <div className="text-muted-foreground text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Fee Distribution */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-base tracking-tight">
            Fee Distribution
          </h2>
          <Badge className="border-primary text-primary" variant="outline">
            Hard-capped forever
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEE_BREAKDOWN.map((fee) => (
            <div className="border border-border p-4" key={fee.label}>
              <div className="mb-1 font-mono text-2xl text-primary">
                {fee.value}
              </div>
              <div className="font-medium text-sm">{fee.label}</div>
              <div className="mt-1 text-muted-foreground text-xs">
                {fee.description}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-muted-foreground text-sm">
          Platform fee is permanently capped at 15% in the program. Impossible
          to raise.
        </p>
      </div>

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

      {/* How It Works */}
      <div className="mb-10">
        <h2 className="mb-4 font-semibold text-base tracking-tight">
          How It Works
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
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
            <div className="border border-border p-4" key={item.step}>
              <div className="mb-2 font-mono text-muted-foreground text-xs">
                {item.step}
              </div>
              <h3 className="mb-2 font-medium text-sm">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center bg-primary">
                <CoinsIcon
                  className="size-4 text-primary-foreground"
                  weight="bold"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">$DATABUDDY</span>
                  <VerifiedBadge />
                </div>
                <p className="text-muted-foreground text-xs">Platform Token</p>
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
          <div className="border border-border p-4">
            <div className="mb-2 text-muted-foreground text-xs uppercase tracking-wider">
              Fee Transparency
            </div>
            <p className="mb-3 text-muted-foreground text-sm">
              All fees are visible on-chain. Nothing is hidden behind tooltips
              or fine print.
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="font-mono text-primary text-xs">15%</div>
                <div className="text-[10px] text-muted-foreground">
                  Platform
                </div>
              </div>
              <div>
                <div className="font-mono text-primary text-xs">30%</div>
                <div className="text-[10px] text-muted-foreground">Meteora</div>
              </div>
              <div>
                <div className="font-mono text-primary text-xs">25%</div>
                <div className="text-[10px] text-muted-foreground">Creator</div>
              </div>
              <div>
                <div className="font-mono text-primary text-xs">30%</div>
                <div className="text-[10px] text-muted-foreground">Charity</div>
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
