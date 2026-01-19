"use client";

import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  LinkBreakIcon,
  SignOutIcon,
  SpinnerIcon,
  WalletIcon,
} from "@phosphor-icons/react";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLinkedWallet,
  linkWallet,
  unlinkWallet,
} from "@/app/actions/wallet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { signIn, signOut, useSession } from "@/lib/auth-client";

function createSignMessage(nonce: string, publicKey: string): string {
  return `Sign this message to verify your wallet ownership.\n\nWallet: ${publicKey}\nNonce: ${nonce}\nApp: Parity`;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatSol(sol: number): string {
  if (sol >= 1000) {
    return `${(sol / 1000).toFixed(1)}k`;
  }
  if (sol >= 1) {
    return sol.toFixed(2);
  }
  if (sol >= 0.01) {
    return sol.toFixed(3);
  }
  return sol.toFixed(4);
}

function WalletSection({
  walletAddress,
  connectedAddress,
  balance,
  linkMutation,
  unlinkMutation,
  onConnect,
}: {
  walletAddress: string | null;
  connectedAddress: string | null;
  balance: { sol: number } | null | undefined;
  linkMutation: { isPending: boolean; mutate: () => void };
  unlinkMutation: { isPending: boolean; mutate: () => void };
  onConnect: () => void;
}) {
  if (walletAddress) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 ring-1 ring-primary/20">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <CheckCircleIcon className="size-5 text-primary" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium font-mono text-sm">
            {shortAddress(walletAddress)}
          </p>
          {balance?.sol !== undefined && (
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CurrencyDollarIcon className="size-3" />
              {formatSol(balance.sol)} SOL
            </p>
          )}
        </div>
        <button
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          disabled={unlinkMutation.isPending}
          onClick={() => unlinkMutation.mutate()}
          title="Unlink wallet"
          type="button"
        >
          {unlinkMutation.isPending ? (
            <SpinnerIcon className="size-4 animate-spin" />
          ) : (
            <LinkBreakIcon className="size-4" />
          )}
        </button>
      </div>
    );
  }

  if (connectedAddress) {
    return (
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-muted/50 p-3 text-left ring-1 ring-border/50 transition-all hover:bg-muted hover:ring-border disabled:opacity-50"
        disabled={linkMutation.isPending}
        onClick={() => linkMutation.mutate()}
        type="button"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <WalletIcon className="size-5 text-primary" weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium font-mono text-sm">
            {shortAddress(connectedAddress)}
          </p>
          <p className="font-medium text-[10px] text-primary">
            {linkMutation.isPending
              ? "Confirm in wallet..."
              : "Click to verify"}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-muted/50 p-3 text-left ring-1 ring-border/50 transition-all hover:bg-muted hover:ring-border"
      onClick={onConnect}
      type="button"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <WalletIcon className="size-5 text-muted-foreground" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">Connect wallet</p>
        <p className="text-[10px] text-muted-foreground">
          Link your Solana wallet
        </p>
      </div>
    </button>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function AuthButton() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const { publicKey, disconnect, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: balance } = useWalletBalance();

  const { data: linkedWallet, isLoading } = useQuery({
    queryKey: ["linkedWallet", session?.user?.id],
    queryFn: getLinkedWallet,
    enabled: !!session?.user,
  });

  const invalidateWallet = () =>
    queryClient.invalidateQueries({ queryKey: ["linkedWallet"] });

  const linkMutation = useMutation({
    mutationFn: async () => {
      if (!(publicKey && signMessage)) {
        throw new Error("Wallet not connected");
      }
      const nonce = crypto.randomUUID();
      const pubkey = publicKey.toBase58();
      const message = createSignMessage(nonce, pubkey);
      const sig = await signMessage(new TextEncoder().encode(message));
      const result = await linkWallet(pubkey, bytesToBase64(sig), nonce);
      if (!result.success) {
        throw new Error(result.error ?? "Failed to link");
      }
      return result;
    },
    onSuccess: invalidateWallet,
  });

  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const result = await unlinkWallet();
      if (!result.success) {
        throw new Error(result.error ?? "Failed to unlink");
      }
      return result;
    },
    onSuccess: invalidateWallet,
  });

  // Loading state
  if (isPending || isLoading) {
    return (
      <div className="flex h-11 w-full items-center justify-center bg-muted/30 ring-1 ring-border/50">
        <SpinnerIcon className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Signed out state
  if (!session?.user) {
    return (
      <div className="space-y-4">
        <div className="px-1">
          <p className="text-[11px] text-muted-foreground uppercase leading-relaxed tracking-wider">
            Authentication
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            Sign in to track your launches
          </p>
        </div>
        <button
          className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-lg bg-white px-4 py-2 text-black transition-all duration-300 hover:bg-zinc-200 active:scale-[0.98]"
          onClick={() => signIn.social({ provider: "twitter" })}
          type="button"
        >
          <XLogo className="size-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-bold text-sm tracking-tight">
            Continue with X
          </span>
        </button>
      </div>
    );
  }

  // Signed in state
  const user = session.user;
  const walletAddress = linkedWallet ?? null;
  const connectedAddress = publicKey?.toBase58() ?? null;
  const error = linkMutation.error || unlinkMutation.error;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg bg-muted/30 px-3 ring-1 ring-border/50 transition-all hover:bg-muted hover:ring-border"
          type="button"
        >
          <Avatar className="size-8 ring-2 ring-background">
            <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary/20 font-bold text-primary text-xs">
              {user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="max-w-full truncate font-medium text-sm">
              {user.name}
            </span>
            {walletAddress ? (
              <span className="font-mono text-[10px] text-primary">
                {shortAddress(walletAddress)}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                No wallet linked
              </span>
            )}
          </div>
          {walletAddress && balance?.sol !== undefined && (
            <span className="font-medium font-mono text-muted-foreground text-xs">
              {formatSol(balance.sol)}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 overflow-hidden border-border/50 bg-popover p-0 shadow-2xl"
        side="top"
        sideOffset={12}
      >
        {/* User info */}
        <div className="flex items-center gap-3 bg-muted/20 p-4">
          <Avatar className="size-12 ring-2 ring-primary/20">
            <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary/20 font-bold text-primary">
              {user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-base leading-none">
              {user.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
              <XLogo className="size-3" />
              Authenticated
            </p>
          </div>
        </div>

        {/* Wallet section */}
        <div className="border-border border-t p-3">
          <WalletSection
            balance={balance}
            connectedAddress={connectedAddress}
            linkMutation={linkMutation}
            onConnect={() => setVisible(true)}
            unlinkMutation={unlinkMutation}
            walletAddress={walletAddress}
          />
          {error && (
            <p className="mt-2 text-destructive text-xs">{error.message}</p>
          )}
        </div>

        {/* Sign out */}
        <div className="border-border border-t">
          <button
            className="flex w-full cursor-pointer items-center gap-3 p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              disconnect();
              signOut();
            }}
            type="button"
          >
            <SignOutIcon className="size-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
