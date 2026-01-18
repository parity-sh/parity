import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  EyeIcon,
  GithubLogoIcon,
  HandshakeIcon,
  LockIcon,
  ScalesIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";

function ParityLogo({ className }: { className?: string }) {
  return <ScalesIcon className={className} weight="bold" />;
}

function VerifiedBadge() {
  return (
    <div className="inline-flex h-4 w-4 items-center justify-center border border-primary">
      <CheckIcon className="h-2.5 w-2.5 text-primary" weight="bold" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero */}
      <section className="border-border border-b py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="mb-6 font-semibold text-4xl leading-tight tracking-tight md:text-5xl">
              Token launches without extraction.
            </h1>
            <p className="mb-8 text-muted-foreground text-xl leading-relaxed">
              Parity is an open, transparent bonding curve launch platform built
              on Solana. Fees are visible, fixed, and enforced on chain.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                className="inline-flex h-12 items-center gap-2 bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                type="button"
              >
                Launch a Token
                <ArrowRightIcon className="h-4 w-4" weight="bold" />
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 border border-border px-6 font-medium text-sm transition-colors hover:bg-muted"
                type="button"
              >
                Read Documentation
                <ArrowUpRightIcon className="h-4 w-4" weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Split */}
      <section className="border-border border-b py-16" id="fees">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-semibold text-lg tracking-tight">
              Fee Distribution
            </h2>
            <Badge className="border-primary text-primary" variant="outline">
              Hard-capped forever
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-1 font-medium font-mono text-3xl">15%</div>
              <div className="text-muted-foreground text-sm">Platform</div>
              <div className="mt-1 text-muted-foreground text-xs">
                Max cap enforced on-chain
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium font-mono text-3xl">30%</div>
              <div className="text-muted-foreground text-sm">Meteora</div>
              <div className="mt-1 text-muted-foreground text-xs">
                Liquidity infrastructure
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium font-mono text-3xl">25%</div>
              <div className="text-muted-foreground text-sm">Creator</div>
              <div className="mt-1 text-muted-foreground text-xs">
                Direct to verified wallet
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium font-mono text-3xl">30%</div>
              <div className="text-muted-foreground text-sm">Charity</div>
              <div className="mt-1 text-muted-foreground text-xs">
                Structural, not optional
              </div>
            </div>
          </div>
          <div className="mt-8 border-border border-t pt-6">
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Platform fee is permanently capped at 15% in the program.
              Impossible to raise. Most platforms take 40-60%. We take less
              because sustainability does not require extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-border border-b py-24" id="values">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 font-semibold text-2xl tracking-tight">
            Core Values
          </h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <EyeIcon className="h-5 w-5 text-primary" weight="bold" />
                <h3 className="font-medium text-lg">Transparency by default</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Every fee path is visible on chain. Every contract is open
                source. Every rule is documented. There are no hidden
                mechanisms.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HandshakeIcon className="h-5 w-5 text-primary" weight="bold" />
                <h3 className="font-medium text-lg">Non-extractive design</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The protocol takes less than the ecosystem. Creators and causes
                get the upside. Users trade without hidden extraction.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon
                  className="h-5 w-5 text-primary"
                  weight="bold"
                />
                <h3 className="font-medium text-lg">Accountability</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Creators verify their identity. Programs are immutable. There
                are no admin rugs. Responsibility is structural.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <LockIcon className="h-5 w-5 text-primary" weight="bold" />
                <h3 className="font-medium text-lg">Neutral ethics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Charity is structural, not marketing. No emotional manipulation.
                The protocol does not promise moonshots. It promises fairness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Section */}
      <section className="border-border border-b py-24" id="protocol">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 font-semibold text-2xl tracking-tight">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border border-border p-6">
              <div className="mb-4 font-mono text-muted-foreground text-sm">
                01
              </div>
              <h3 className="mb-3 font-medium text-lg">Launch</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Creators launch tokens with a fixed bonding curve. Parameters
                are set once and enforced on chain. No modifications after
                deployment.
              </p>
            </div>
            <div className="border border-border p-6">
              <div className="mb-4 font-mono text-muted-foreground text-sm">
                02
              </div>
              <h3 className="mb-3 font-medium text-lg">Trade</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Users buy and sell on the curve. Fees are displayed before every
                transaction. No slippage beyond the quoted amount.
              </p>
            </div>
            <div className="border border-border p-6">
              <div className="mb-4 font-mono text-muted-foreground text-sm">
                03
              </div>
              <h3 className="mb-3 font-medium text-lg">Verify</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All program IDs are public. Audit reports are linked. Creator
                verification status is always visible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="border-border border-b py-24" id="verification">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 font-semibold text-2xl tracking-tight">
            Verification Levels
          </h2>
          <p className="mb-12 max-w-2xl text-muted-foreground">
            Creator verification is visible on every launch. Three levels
            indicate the depth of identity confirmation.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border border-border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Badge
                  className="border-muted-foreground text-muted-foreground"
                  variant="outline"
                >
                  Unverified
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No identity verification. Wallet address only. Exercise caution.
              </p>
            </div>
            <div className="border border-border p-6">
              <div className="mb-4 flex items-center gap-3">
                <VerifiedBadge />
                <Badge
                  className="border-primary text-primary"
                  variant="outline"
                >
                  Identity Verified
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Creator has verified their identity through our KYC process.
                Real person confirmed.
              </p>
            </div>
            <div className="border border-border p-6">
              <div className="mb-4 flex items-center gap-3">
                <VerifiedBadge />
                <Badge
                  className="border-primary text-primary"
                  variant="outline"
                >
                  Verified + History
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Identity verified with on-chain history. Track record of
                previous successful launches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Launch Card */}
      <section className="border-border border-b py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 font-semibold text-2xl tracking-tight">
            Data Visibility
          </h2>
          <div className="max-w-md border border-border">
            <div className="border-border border-b p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Example Token</span>
                  <VerifiedBadge />
                </div>
                <Badge
                  className="border-primary text-primary"
                  variant="outline"
                >
                  Live
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                All fees are visible. Nothing is hidden behind tooltips.
              </p>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-mono">1,000,000,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-mono">0.00000142 SOL</span>
              </div>
              <div className="border-border border-t pt-4">
                <div className="mb-2 text-muted-foreground text-xs uppercase tracking-wide">
                  Fee Breakdown
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-mono">15%</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Meteora</span>
                  <span className="font-mono">30%</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="font-mono">25%</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Charity</span>
                  <span className="font-mono">30%</span>
                </div>
              </div>
              <div className="border-border border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Charity Wallet</span>
                  <span className="font-mono text-xs">8xK2...4mNq</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Donated</span>
                  <span className="font-mono">142.5 SOL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-border border-b py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 font-semibold text-2xl tracking-tight">
            Trust Signals
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">Program ID</div>
              <div className="break-all font-mono text-sm">
                PrtyXy1H8JvU9DmBvJqAhRFfY1cQHQqVe7uxHMPHJNk
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">Audit Status</div>
              <div className="flex items-center gap-2">
                <VerifiedBadge />
                <span className="text-sm">Audited by OtterSec</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">Source Code</div>
              <a
                className="text-primary text-sm hover:underline"
                href="https://github.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                github.com/parity-protocol/parity
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <ParityLogo className="h-6 w-6 text-foreground" />
              <span className="text-muted-foreground text-sm">
                Open. Transparent. Fair.
              </span>
            </div>
            <div className="flex items-center gap-8 text-muted-foreground text-sm">
              <a
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                href="https://github.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <GithubLogoIcon className="h-4 w-4" weight="bold" />
                GitHub
              </a>
              <a
                className="transition-colors hover:text-foreground"
                href="/docs"
              >
                Documentation
              </a>
              <a
                className="transition-colors hover:text-foreground"
                href="/audit"
              >
                Audit Report
              </a>
            </div>
          </div>
          <div className="mt-8 border-border border-t pt-8">
            <div className="flex flex-col items-start justify-between gap-4 text-muted-foreground text-xs md:flex-row md:items-center">
              <div className="font-mono">
                Program: PrtyXy1H8JvU9DmBvJqAhRFfY1cQHQqVe7uxHMPHJNk
              </div>
              <div>Built on Solana</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
