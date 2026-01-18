"use client";

import {
  CheckIcon,
  LinkBreakIcon,
  SignOutIcon,
  SpinnerIcon,
  WalletIcon,
  XLogoIcon,
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

function TriggerLabel({
  walletAddress,
  connected,
}: {
  walletAddress: string | null;
  connected: boolean;
}) {
  if (walletAddress) {
    return (
      <span className="font-mono text-sm">{shortAddress(walletAddress)}</span>
    );
  }
  if (connected) {
    return <span className="text-muted-foreground text-sm">Link wallet</span>;
  }
  return <span className="text-muted-foreground text-sm">Connect</span>;
}

function LinkedWallet({
  address,
  onUnlink,
  isUnlinking,
}: {
  address: string;
  onUnlink: () => void;
  isUnlinking: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded bg-primary/5 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center bg-primary/10">
        <WalletIcon className="size-5 text-primary" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm">{shortAddress(address)}</p>
        <p className="flex items-center gap-1 text-primary text-xs">
          <CheckIcon className="size-3" weight="bold" />
          Verified
        </p>
      </div>
      <button
        className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        disabled={isUnlinking}
        onClick={onUnlink}
        title="Unlink wallet"
        type="button"
      >
        {isUnlinking ? (
          <SpinnerIcon className="size-4 animate-spin" />
        ) : (
          <LinkBreakIcon className="size-4" weight="bold" />
        )}
      </button>
    </div>
  );
}

function ConnectedWallet({
  address,
  onLink,
  isLinking,
}: {
  address: string;
  onLink: () => void;
  isLinking: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded bg-muted/50 p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
      disabled={isLinking}
      onClick={onLink}
      type="button"
    >
      <div className="flex size-9 shrink-0 items-center justify-center bg-primary/10">
        <WalletIcon className="size-5 text-primary" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm">{shortAddress(address)}</p>
        <p className="text-primary text-xs">
          {isLinking ? "Confirm in wallet..." : "Click to verify"}
        </p>
      </div>
    </button>
  );
}

function NoWallet({ onConnect }: { onConnect: () => void }) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded bg-muted/50 p-3 text-left transition-colors hover:bg-muted"
      onClick={onConnect}
      type="button"
    >
      <div className="flex size-9 shrink-0 items-center justify-center bg-muted">
        <WalletIcon className="size-5 text-muted-foreground" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">Connect wallet</p>
        <p className="text-muted-foreground text-xs">Link a Solana wallet</p>
      </div>
    </button>
  );
}

function WalletSection({
  walletAddress,
  connectedAddress,
  onConnect,
  onLink,
  onUnlink,
  isLinking,
  isUnlinking,
}: {
  walletAddress: string | null;
  connectedAddress: string | null;
  onConnect: () => void;
  onLink: () => void;
  onUnlink: () => void;
  isLinking: boolean;
  isUnlinking: boolean;
}) {
  if (walletAddress) {
    return (
      <LinkedWallet
        address={walletAddress}
        isUnlinking={isUnlinking}
        onUnlink={onUnlink}
      />
    );
  }
  if (connectedAddress) {
    return (
      <ConnectedWallet
        address={connectedAddress}
        isLinking={isLinking}
        onLink={onLink}
      />
    );
  }
  return <NoWallet onConnect={onConnect} />;
}

export function AuthButton() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const { publicKey, disconnect, connected, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

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

  if (isPending || isLoading) {
    return <div className="h-10 w-28 animate-pulse bg-muted" />;
  }

  if (!session?.user) {
    return (
      <button
        className="flex h-10 items-center gap-2 bg-foreground px-4 text-background text-sm transition-opacity hover:opacity-80"
        onClick={() => signIn.social({ provider: "twitter" })}
        type="button"
      >
        <XLogoIcon className="size-4" weight="bold" />
        Sign in
      </button>
    );
  }

  const user = session.user;
  const walletAddress = linkedWallet ?? null;
  const connectedAddress = publicKey?.toBase58() ?? null;
  const error = linkMutation.error || unlinkMutation.error;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-10 items-center gap-2 border border-border bg-card px-3 transition-colors hover:bg-muted"
          type="button"
        >
          <div className="relative">
            <Avatar className="size-6">
              <AvatarImage
                alt={user.name ?? ""}
                src={user.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {walletAddress && (
              <div className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center bg-primary">
                <CheckIcon
                  className="size-2.5 text-primary-foreground"
                  weight="bold"
                />
              </div>
            )}
          </div>
          <TriggerLabel connected={connected} walletAddress={walletAddress} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                alt={user.name ?? ""}
                src={user.image ?? undefined}
              />
              <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{user.name}</p>
              <p className="text-muted-foreground text-xs">Signed in via X</p>
            </div>
          </div>
        </div>

        <div className="p-3">
          <p className="mb-2 px-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Wallet
          </p>
          <WalletSection
            connectedAddress={connectedAddress}
            isLinking={linkMutation.isPending}
            isUnlinking={unlinkMutation.isPending}
            onConnect={() => setVisible(true)}
            onLink={() => linkMutation.mutate()}
            onUnlink={() => unlinkMutation.mutate()}
            walletAddress={walletAddress}
          />
          {error && (
            <p className="mt-2 px-1 text-destructive text-xs">
              {error.message}
            </p>
          )}
        </div>

        <div className="border-border border-t p-2">
          <button
            className="flex w-full items-center gap-3 p-2 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              disconnect();
              signOut();
            }}
            type="button"
          >
            <SignOutIcon className="size-4" weight="bold" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
