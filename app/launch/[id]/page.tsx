"use client";

import {
  CaretDown,
  CheckCircle,
  Clock,
  Copy,
  Rocket,
  Spinner,
  Trash,
  TrendDown,
  TrendUp,
  Wallet,
  Warning,
} from "@phosphor-icons/react";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  SendTransactionError,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  generateMockPriceData,
  TokenPriceChart,
} from "@/components/charts/token-price-chart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { rpc } from "@/lib/rpc/client";
import { getConnection } from "@/lib/solana";
import { cn } from "@/lib/utils";

const TRADING_LINKS = [
  { name: "Jupiter", getUrl: (m: string) => `https://jup.ag/swap/SOL-${m}` },
  {
    name: "Raydium",
    getUrl: (m: string) =>
      `https://raydium.io/swap/?inputMint=sol&outputMint=${m}`,
  },
  { name: "Birdeye", getUrl: (m: string) => `https://birdeye.so/token/${m}` },
  {
    name: "DexScreener",
    getUrl: (m: string) => `https://dexscreener.com/solana/${m}`,
  },
] as const;

function TradingLinksSection({ tokenMint }: { tokenMint: string }) {
  return (
    <div className="border border-border bg-card p-6">
      <h3 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Trade on
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TRADING_LINKS.map((link) => (
          <a
            className="flex items-center justify-center gap-2 bg-muted/50 px-4 py-3 font-medium text-sm transition-colors hover:bg-muted"
            href={link.getUrl(tokenMint)}
            key={link.name}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.name}
            <ArrowSquareOutIcon className="size-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function CopyableAddress({
  label,
  address,
}: {
  label: string;
  address: string;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <button
        className="flex items-center gap-1 font-mono text-sm hover:text-primary"
        onClick={() => copyToClipboard(address)}
        type="button"
      >
        {address.slice(0, 4)}...{address.slice(-4)}
        <Copy className="size-3.5" />
      </button>
    </div>
  );
}

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
    return `${sol.toFixed(4)} SOL`;
  }
  if (sol < 100) {
    return `${sol.toFixed(2)} SOL`;
  }
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 0 })} SOL`;
}

// Quick buy component
function QuickBuy({
  poolAddress,
  symbol,
  onSuccess,
}: {
  poolAddress: string;
  symbol: string;
  onSuccess?: () => void;
}) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { connection } = useConnection();
  const { data: balance, refetch: refetchBalance } = useWalletBalance();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountLamports = amount
    ? BigInt(Math.floor(Number.parseFloat(amount) * LAMPORTS_PER_SOL))
    : BigInt(0);

  const { data: quote, isFetching: isQuoting } = useQuery({
    queryKey: ["swap-quote", poolAddress, amount],
    queryFn: () =>
      amountLamports > 0
        ? rpc.pool.quote({
            poolAddress,
            amount: amountLamports.toString(),
            swapType: "buy",
          })
        : null,
    enabled: amountLamports > 0,
    staleTime: 5000,
  });

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!(publicKey && signTransaction)) {
        throw new Error("Wallet not connected");
      }
      if (!amount || amountLamports <= 0) {
        throw new Error("Enter an amount");
      }
      setError(null);

      const result = await rpc.pool.buildSwap({
        poolAddress,
        userWallet: publicKey.toBase58(),
        amount: amountLamports.toString(),
        swapType: "buy",
        slippageBps: 100,
      });

      const txBuffer = Buffer.from(result.transaction, "base64");
      let signedTx: Transaction | VersionedTransaction;

      try {
        signedTx = await signTransaction(
          VersionedTransaction.deserialize(txBuffer)
        );
      } catch {
        signedTx = await signTransaction(Transaction.from(txBuffer));
      }

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: true, maxRetries: 3 }
      );

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      return { signature, outAmount: result.outAmount };
    },
    onSuccess: () => {
      setAmount("");
      refetchBalance();
      queryClient.invalidateQueries({ queryKey: ["pool-price", poolAddress] });
      onSuccess?.();
    },
    onError: (err) => setError(err.message),
  });

  const handleSwap = () => {
    if (!connected) {
      openWalletModal(true);
      return;
    }
    swapMutation.mutate();
  };

  const formattedQuote = quote
    ? (Number(quote.outAmount) / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          className="h-14 w-full border-0 bg-muted/50 px-4 pr-20 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          inputMode="decimal"
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          type="text"
          value={amount}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-muted-foreground">
          SOL
        </span>
      </div>

      <div className="flex gap-2">
        {[0.1, 0.5, 1, 2].map((val) => (
          <button
            className="flex-1 bg-muted/50 py-2 font-mono text-sm transition-colors hover:bg-muted"
            key={val}
            onClick={() => setAmount(val.toString())}
            type="button"
          >
            {val}
          </button>
        ))}
        {balance && (
          <button
            className="flex-1 bg-muted/50 py-2 text-sm transition-colors hover:bg-muted"
            onClick={() =>
              setAmount(Math.max(0, balance.sol - 0.01).toFixed(4))
            }
            type="button"
          >
            MAX
          </button>
        )}
      </div>

      {isQuoting && (
        <p className="text-muted-foreground text-sm">Getting quote...</p>
      )}
      {formattedQuote && !isQuoting && (
        <div className="flex items-center justify-between bg-primary/5 p-3">
          <span className="text-muted-foreground text-sm">You receive</span>
          <span className="font-medium font-mono">
            ~{formattedQuote} {symbol}
          </span>
        </div>
      )}

      <button
        className="flex h-12 w-full items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        disabled={swapMutation.isPending}
        onClick={handleSwap}
        type="button"
      >
        {!connected && (
          <>
            <Wallet className="size-5" weight="bold" />
            Connect Wallet
          </>
        )}
        {connected && swapMutation.isPending && (
          <>
            <Spinner className="size-5 animate-spin" />
            Swapping...
          </>
        )}
        {connected && !swapMutation.isPending && `Buy ${symbol}`}
      </button>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {swapMutation.isSuccess && (
        <div className="flex items-center gap-2 text-emerald-500 text-sm">
          <CheckCircle className="size-4" weight="fill" />
          Swap successful!
        </div>
      )}
    </div>
  );
}

export default function LaunchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const [deployError, setDeployError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: launch, isLoading } = useQuery({
    queryKey: ["launch", id],
    queryFn: () => rpc.launch.get({ id }),
  });

  const { data: priceData } = useQuery({
    queryKey: ["pool-price", launch?.poolAddress],
    queryFn: () =>
      launch?.poolAddress
        ? rpc.pool.price({ poolAddress: launch.poolAddress })
        : null,
    enabled: !!launch?.poolAddress && launch.status === "active",
    refetchInterval: 10_000,
    staleTime: 5000,
  });

  // Generate mock chart data based on current price
  const chartData = priceData
    ? generateMockPriceData(priceData.spotPrice, 24)
    : [];
  const lastPrice = chartData.at(-1);
  const firstPrice = chartData.at(0);
  const priceChange =
    lastPrice && firstPrice
      ? ((lastPrice.price - firstPrice.price) / firstPrice.price) * 100
      : 0;

  const deleteMutation = useMutation({
    mutationFn: () => rpc.launch.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launches"] });
      router.push("/launches");
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!(publicKey && signTransaction)) {
        throw new Error("Wallet not connected");
      }
      setDeployError(null);

      const connection = getConnection();
      const prepare = await rpc.launch.prepareDeploy({
        id,
        creatorWallet: publicKey.toBase58(),
      });

      if (prepare.alreadyDeployed) {
        return { poolAddress: prepare.poolAddress };
      }

      const recovery = await rpc.launch.recoverDeploy({
        id,
        poolAddress: prepare.poolAddress,
        tokenMint: prepare.baseMint,
      });

      if (recovery.success) {
        return { poolAddress: prepare.poolAddress };
      }

      const txBuffer = Buffer.from(prepare.transaction, "base64");
      let signedTx: Transaction | VersionedTransaction;

      try {
        signedTx = await signTransaction(
          VersionedTransaction.deserialize(txBuffer)
        );
      } catch {
        signedTx = await signTransaction(Transaction.from(txBuffer));
      }

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      let signature: string;
      try {
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: true,
          maxRetries: 3,
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes("AlreadyProcessed")) {
          const retry = await rpc.launch.recoverDeploy({
            id,
            poolAddress: prepare.poolAddress,
            tokenMint: prepare.baseMint,
          });
          if (retry.success) {
            return { poolAddress: prepare.poolAddress };
          }
          throw new Error("Transaction processed but pool not found");
        }
        if (err instanceof SendTransactionError) {
          const logs = await err.getLogs(connection);
          throw new Error(
            logs?.find((l) => l.includes("Error")) ?? err.message
          );
        }
        throw err;
      }

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      await new Promise((r) => setTimeout(r, 1500));
      await rpc.launch.confirmDeploy({
        id,
        poolAddress: prepare.poolAddress,
        tokenMint: prepare.baseMint,
        signature,
      });

      return { poolAddress: prepare.poolAddress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launch", id] });
      queryClient.invalidateQueries({ queryKey: ["launches"] });
    },
    onError: (err) => setDeployError(err.message),
  });

  const handleDeploy = () => {
    if (!connected) {
      openWalletModal(true);
      return;
    }
    deployMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <Warning
            className="mx-auto size-12 text-muted-foreground"
            weight="duotone"
          />
          <h1 className="mt-4 font-medium text-xl">Launch not found</h1>
          <Link
            className="mt-4 inline-block text-primary hover:underline"
            href="/explore"
          >
            Browse all launches
          </Link>
        </div>
      </div>
    );
  }

  const isActive = launch.status === "active";
  const isPending = launch.status === "pending";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Back link */}
      <Link
        className="mb-6 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        href="/explore"
      >
        <span>All Launches</span>
      </Link>

      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">
              {launch.name}
            </h1>
            <p className="mt-1 font-mono text-muted-foreground text-xl">
              ${launch.symbol}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 font-medium text-sm",
              isPending && "bg-muted text-muted-foreground",
              isActive && "bg-emerald-500/10 text-emerald-500",
              launch.status === "migrated" && "bg-blue-500/10 text-blue-500",
              launch.status === "failed" && "bg-destructive/10 text-destructive"
            )}
          >
            {isPending && <Clock className="size-4" weight="bold" />}
            {isActive && <Rocket className="size-4" weight="bold" />}
            {launch.status === "migrated" && (
              <CheckCircle className="size-4" weight="bold" />
            )}
            {launch.status === "failed" && (
              <Warning className="size-4" weight="bold" />
            )}
            <span className="capitalize">{launch.status}</span>
          </div>
        </div>

        {launch.description && (
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {launch.description}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Stats & Chart */}
        <div className="space-y-6 lg:col-span-3">
          {/* Price Stats */}
          {isActive && priceData && (
            <div className="border border-border bg-card p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Price</p>
                  <p className="font-mono font-semibold text-3xl">
                    {formatPrice(priceData.spotPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 font-mono text-sm",
                      priceChange >= 0
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {priceChange >= 0 ? (
                      <TrendUp className="size-4" weight="bold" />
                    ) : (
                      <TrendDown className="size-4" weight="bold" />
                    )}
                    {Math.abs(priceChange).toFixed(2)}%
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {formatSol(priceData.poolLiquiditySol)} liquidity
                  </p>
                </div>
              </div>

              {/* Chart */}
              <TokenPriceChart data={chartData} priceChange={priceChange} />

              {/* Live indicator */}
              <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live price updates
              </div>
            </div>
          )}

          {/* Pending State */}
          {isPending && (
            <div className="border border-border bg-card p-6">
              <div className="text-center">
                <Clock
                  className="mx-auto size-12 text-muted-foreground"
                  weight="duotone"
                />
                <h2 className="mt-4 font-medium text-lg">Ready to Deploy</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  Deploy this token to create a trading pool on Meteora.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    className="flex h-12 flex-1 items-center justify-center gap-2 bg-primary font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    disabled={deployMutation.isPending}
                    onClick={handleDeploy}
                    type="button"
                  >
                    {deployMutation.isPending ? (
                      <>
                        <Spinner className="size-5 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="size-5" weight="bold" />
                        {connected ? "Deploy Token" : "Connect Wallet"}
                      </>
                    )}
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="flex size-12 items-center justify-center border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        disabled={
                          deleteMutation.isPending || deployMutation.isPending
                        }
                        type="button"
                      >
                        <Trash className="size-5" weight="bold" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete {launch.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate()}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {deployError && (
                  <p className="mt-4 text-destructive text-sm">{deployError}</p>
                )}
              </div>
            </div>
          )}

          {/* Trading Links */}
          {isActive && launch.tokenMint && (
            <TradingLinksSection tokenMint={launch.tokenMint} />
          )}
        </div>

        {/* Right Column - Buy & Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Buy */}
          {isActive && launch.poolAddress && (
            <div className="border border-primary/20 bg-card p-6">
              <h3 className="mb-4 font-medium">Quick Buy</h3>
              <QuickBuy
                poolAddress={launch.poolAddress}
                symbol={launch.symbol}
              />
            </div>
          )}

          {/* Token Details (Collapsible) */}
          <Collapsible onOpenChange={setDetailsOpen} open={detailsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between border border-border bg-card p-4 text-left hover:bg-muted/50">
              <span className="font-medium text-sm">Token Details</span>
              <CaretDown
                className={cn(
                  "size-5 transition-transform",
                  detailsOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="border border-border border-t-0 bg-card">
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <span className="text-muted-foreground text-sm">
                    Creator Fee
                  </span>
                  <span className="font-mono text-sm">0.95% → 0.05%</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-muted-foreground text-sm">Charity</span>
                  <span className="text-sm">
                    {launch.charityName ?? "Unnamed"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-muted-foreground text-sm">
                    Charity Wallet
                  </span>
                  <button
                    className="flex items-center gap-1 font-mono text-sm hover:text-primary"
                    onClick={() => copyToClipboard(launch.charityWallet)}
                    type="button"
                  >
                    {launch.charityWallet.slice(0, 4)}...
                    {launch.charityWallet.slice(-4)}
                    <Copy className="size-3.5" />
                  </button>
                </div>
                {launch.poolAddress && (
                  <CopyableAddress
                    address={launch.poolAddress}
                    label="Pool Address"
                  />
                )}
                {launch.tokenMint && (
                  <CopyableAddress
                    address={launch.tokenMint}
                    label="Token Mint"
                  />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
