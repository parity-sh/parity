"use client";

import { GithubLogoIcon, ScalesIcon } from "@phosphor-icons/react";
import { AuthButton } from "./auth-button";

export function Header() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a className="flex items-center gap-3" href="/">
          <ScalesIcon className="h-8 w-8 text-foreground" weight="bold" />
          <span className="font-medium text-lg tracking-tight">Parity</span>
        </a>
        <nav className="hidden items-center gap-8 text-muted-foreground text-sm md:flex">
          <a className="transition-colors hover:text-foreground" href="#fees">
            Fees
          </a>
          <a
            className="transition-colors hover:text-foreground"
            href="#protocol"
          >
            Protocol
          </a>
          <a
            className="transition-colors hover:text-foreground"
            href="#verification"
          >
            Verification
          </a>
          <a
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            href="https://github.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubLogoIcon className="h-4 w-4" weight="bold" />
            GitHub
          </a>
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}
