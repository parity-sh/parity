import { os } from "@orpc/server";
import { chainRouter } from "./routes/chain";
import { configRouter } from "./routes/config";
import { launchRouter } from "./routes/launch";
import { poolRouter } from "./routes/pool";

export const router = os.router({
  chain: chainRouter,
  config: configRouter,
  launch: launchRouter,
  pool: poolRouter,
});

export type Router = typeof router;
