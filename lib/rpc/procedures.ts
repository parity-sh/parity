import { os } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export const publicProcedure = os;

export const authedProcedure = os.use(async ({ next }) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new UnauthorizedError(
        "You must be logged in to perform this action"
      );
    }
    return next({ context: { user: session.user } });
  } catch (error) {
    // Re-throw UnauthorizedError as-is
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    // Wrap other auth errors
    throw new UnauthorizedError(
      "Authentication failed. Please try logging in again."
    );
  }
});
