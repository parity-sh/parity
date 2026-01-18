"use client";

import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";

const DEMO_COINS = [
  { symbol: "DATABUDDY", price: 0.003_21, change: 18.4, featured: true },
  { symbol: "DOGE", price: 0.002_34, change: 12.5 },
  { symbol: "PEPE", price: 0.000_89, change: -4.2 },
  { symbol: "BONK", price: 0.001_56, change: 8.7 },
  { symbol: "WIF", price: 0.004_32, change: 23.1 },
  { symbol: "POPCAT", price: 0.000_67, change: -1.8 },
  { symbol: "MOCHI", price: 0.001_98, change: 5.4 },
  { symbol: "SAMO", price: 0.003_45, change: -7.3 },
  { symbol: "COPE", price: 0.001_23, change: 15.9 },
];

function CoinItem({
  symbol,
  price,
  change,
  featured,
}: {
  symbol: string;
  price: number;
  change: number;
  featured?: boolean;
}) {
  const isPositive = change >= 0;

  return (
    <div className="flex shrink-0 items-center gap-3 px-4">
      <span
        className={`font-medium font-mono text-sm ${featured ? "text-primary" : ""}`}
      >
        ${symbol}
      </span>
      <span className="font-mono text-muted-foreground text-xs">
        {price.toFixed(5)} SOL
      </span>
      <span
        className={`flex items-center gap-0.5 font-mono text-xs ${
          isPositive ? "text-primary" : "text-destructive"
        }`}
      >
        {isPositive ? (
          <TrendUpIcon className="size-3" weight="bold" />
        ) : (
          <TrendDownIcon className="size-3" weight="bold" />
        )}
        {isPositive ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </div>
  );
}

export function CoinTicker() {
  return (
    <div className="border-border border-b bg-card/50">
      <div className="relative flex h-10 items-center overflow-hidden">
        <div className="flex animate-marquee">
          {DEMO_COINS.map((coin) => (
            <CoinItem key={coin.symbol} {...coin} />
          ))}
          {DEMO_COINS.map((coin) => (
            <CoinItem key={`${coin.symbol}-dup`} {...coin} />
          ))}
        </div>
      </div>
    </div>
  );
}
