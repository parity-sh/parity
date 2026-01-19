# AGENTS.md

Guidelines for AI agents working on the Parity codebase.

## Quick Reference

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun lint` | Check code with Biome |
| `bun format` | Format code with Biome |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:push` | Push schema to database |
| `bun db:studio` | Open Drizzle Studio |

## Project

**Parity** — A token launch platform built on Solana using Meteora Dynamic Bonding Curves.

## Imports

- Use `@/` alias for absolute imports (e.g., `@/components/ui/button`)
- Biome auto-organizes imports

## Key Utilities

```typescript
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { useWallet } from "@solana/wallet-adapter-react";
```

## File Structure

```
app/              # Next.js App Router
components/       # React components
  ui/            # shadcn/ui base components
  providers/     # Context providers
hooks/           # Custom React hooks
lib/             # Utilities, auth client, DB config
actions/         # Server actions
```

