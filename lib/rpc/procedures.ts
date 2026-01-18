import { os } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const publicProcedure = os;

export const authedProcedure = os.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return next({ context: { user: session.user } });
});
