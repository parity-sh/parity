"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { SolanaProvider } from "./wallet-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SolanaProvider>{children}</SolanaProvider>
    </QueryProvider>
  );
}
