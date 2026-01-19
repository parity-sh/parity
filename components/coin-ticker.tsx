"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { rpc } from "@/lib/rpc/client";

function CoinItem({
  id,
  symbol,
  image,
  price,
  liquiditySol,
}: {
  id: string;
  symbol: string;
  image: string | null;
  price: number;
  liquiditySol: number;
}) {
  return (
    <Link
      className="flex shrink-0 items-center gap-2.5 px-5 transition-colors hover:bg-muted/50"
      href={`/${id}`}
    >
      {image ? (
        <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image alt={symbol} className="object-cover" fill src={image} />
        </div>
      ) : (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="font-mono text-muted-foreground text-xs">
            {symbol.slice(0, 1)}
          </span>
        </div>
      )}
      <span className="font-mono font-semibold text-sm">${symbol}</span>
      <span className="font-mono text-muted-foreground text-sm">
        {price.toFixed(6)} SOL
      </span>
      <span className="font-mono text-muted-foreground/60 text-xs">
        {liquiditySol.toFixed(1)} liq
      </span>
    </Link>
  );
}

export function CoinTicker() {
  const { data: coins = [], isLoading } = useQuery({
    queryKey: ["ticker"],
    queryFn: () => rpc.launch.ticker({ limit: 20 }),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  if (isLoading) {
    return (
      <div className="border-border border-b bg-card/50">
        <div className="flex h-12 items-center px-4 text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="border-border border-b bg-card/50">
        <div className="flex h-12 items-center px-4 text-muted-foreground text-sm">
          No active launches yet
        </div>
      </div>
    );
  }

  return (
    <div className="border-border border-b bg-card/50">
      <div className="relative flex h-12 items-center overflow-hidden">
        <div className="flex animate-marquee">
          {coins.map((c, i) => (
            <CoinItem
              id={c.id}
              image={c.image}
              key={`${c.symbol}-${i}`}
              liquiditySol={c.liquiditySol}
              price={c.price}
              symbol={c.symbol}
            />
          ))}
          {coins.map((c, i) => (
            <CoinItem
              id={c.id}
              image={c.image}
              key={`${c.symbol}-dup-${i}`}
              liquiditySol={c.liquiditySol}
              price={c.price}
              symbol={c.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
