import { PublicKey } from "@solana/web3.js";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { launch, user } from "@/lib/db/auth-schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  buildCreatePoolTransaction,
  getPoolPriceData,
  verifyPoolCreated,
} from "@/lib/meteora";
import { authedProcedure, publicProcedure } from "../procedures";

const solanaAddress = z.string().refine(
  (val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid Solana address" }
);

async function getLaunchByOwner(id: string, creatorId: string) {
  const [result] = await db
    .select()
    .from(launch)
    .where(and(eq(launch.id, id), eq(launch.creatorId, creatorId)))
    .limit(1);
  return result ?? null;
}

export const launchRouter = {
  ticker: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(20).default(20) }).optional()
    )
    .handler(async ({ input }) => {
      const activeLaunches = await db
        .select({
          id: launch.id,
          name: launch.name,
          symbol: launch.symbol,
          image: launch.image,
          poolAddress: launch.poolAddress,
        })
        .from(launch)
        .where(and(eq(launch.status, "active"), isNotNull(launch.poolAddress)))
        .orderBy(desc(launch.createdAt))
        .limit(input?.limit ?? 20);

      return Promise.all(
        activeLaunches.map(async (l) => {
          const price = l.poolAddress
            ? await getPoolPriceData(l.poolAddress)
            : null;
          return {
            id: l.id,
            symbol: l.symbol,
            name: l.name,
            image: l.image,
            poolAddress: l.poolAddress,
            price: price?.spotPrice ?? 0,
            liquiditySol: price?.poolLiquiditySol ?? 0,
          };
        })
      );
    }),

  list: authedProcedure.handler(async ({ context }) => {
    return await db
      .select()
      .from(launch)
      .where(eq(launch.creatorId, context.user.id))
      .orderBy(desc(launch.createdAt));
  }),

  listAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          status: z
            .enum(["pending", "active", "migrated", "failed"])
            .optional(),
          sortBy: z.enum(["recent", "marketCap"]).default("recent"),
        })
        .optional()
    )
    .handler(async ({ input }) => {
      const conditions = input?.status ? [eq(launch.status, input.status)] : [];

      const query = db
        .select({
          id: launch.id,
          name: launch.name,
          symbol: launch.symbol,
          description: launch.description,
          image: launch.image,
          curvePreset: launch.curvePreset,
          charityName: launch.charityName,
          charityWallet: launch.charityWallet,
          status: launch.status,
          poolAddress: launch.poolAddress,
          tokenMint: launch.tokenMint,
          createdAt: launch.createdAt,
          migratedAt: launch.migratedAt,
          creator: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(launch)
        .leftJoin(user, eq(launch.creatorId, user.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(input?.limit ?? 50);

      return await query.orderBy(desc(launch.createdAt));
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      try {
        const isUUID = input.id.includes("-") && input.id.length === 36;
        const condition = isUUID
          ? eq(launch.id, input.id)
          : eq(launch.tokenMint, input.id);

        const [result] = await db
          .select()
          .from(launch)
          .where(condition)
          .limit(1);
        if (!result) {
          throw new NotFoundError("Launch");
        }
        return result;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new Error("Failed to fetch launch. Please try again.");
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        symbol: z.string().min(1).max(10).toUpperCase(),
        description: z.string().max(500).optional(),
        image: z.url().optional(),
        charityWallet: solanaAddress,
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      try {
        const id = crypto.randomUUID();
        await db.insert(launch).values({
          id,
          creatorId: context.user.id,
          name: input.name,
          symbol: input.symbol,
          description: input.description,
          image: input.image,
          curvePreset: "standard", // All launches use standard curve with dynamic fees
          charityWallet: input.charityWallet,
          charityName: input.charityName,
          status: "pending",
        });
        return { id };
      } catch (error) {
        if (error instanceof Error && error.message.includes("unique")) {
          throw new ConflictError(
            "A launch with this name or symbol already exists"
          );
        }
        throw new Error("Failed to create launch. Please try again.");
      }
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        symbol: z.string().min(1).max(10).toUpperCase().optional(),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        charityWallet: solanaAddress.optional(),
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      try {
        const { id, ...updates } = input;
        const existing = await getLaunchByOwner(id, context.user.id);
        if (!existing) {
          throw new NotFoundError("Launch");
        }
        if (existing.status !== "pending") {
          throw new ConflictError(
            "Cannot update a launch that has already been deployed"
          );
        }

        await db.update(launch).set(updates).where(eq(launch.id, id));
        return { success: true };
      } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError) {
          throw error;
        }
        throw new Error("Failed to update launch. Please try again.");
      }
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      try {
        const existing = await getLaunchByOwner(input.id, context.user.id);
        if (!existing) {
          throw new NotFoundError("Launch");
        }
        if (existing.status !== "pending") {
          throw new ConflictError(
            "Cannot delete a launch that has already been deployed"
          );
        }

        await db.delete(launch).where(eq(launch.id, input.id));
        return { success: true };
      } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError) {
          throw error;
        }
        throw new Error("Failed to delete launch. Please try again.");
      }
    }),

  prepareDeploy: authedProcedure
    .input(z.object({ id: z.string(), creatorWallet: solanaAddress }))
    .handler(async ({ input, context }) => {
      try {
        const existing = await getLaunchByOwner(input.id, context.user.id);
        if (!existing) {
          throw new NotFoundError("Launch");
        }
        if (existing.status !== "pending") {
          throw new ConflictError("This launch has already been deployed");
        }

        if (existing.poolAddress && existing.tokenMint) {
          const exists = await verifyPoolCreated(existing.poolAddress, 3, 1000);
          if (exists) {
            await db
              .update(launch)
              .set({ status: "active" })
              .where(eq(launch.id, input.id));
            return {
              transaction: "",
              baseMint: existing.tokenMint,
              poolAddress: existing.poolAddress,
              launchId: input.id,
              alreadyDeployed: true,
              lastValidBlockHeight: 0,
            };
          }
        }

        const uri = `https://parity.sh/api/metadata/${existing.id}.json`;
        const onChainSymbol = `${existing.symbol}ᴾ`;
        const result = await buildCreatePoolTransaction({
          name: existing.name,
          symbol: onChainSymbol,
          uri,
          curvePreset: existing.curvePreset,
          creatorPublicKey: input.creatorWallet,
        });

        await db
          .update(launch)
          .set({ poolAddress: result.poolAddress, tokenMint: result.baseMint })
          .where(eq(launch.id, input.id));

        return {
          transaction: result.transaction,
          baseMint: result.baseMint,
          poolAddress: result.poolAddress,
          launchId: input.id,
          lastValidBlockHeight: result.lastValidBlockHeight,
        };
      } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError) {
          throw error;
        }
        if (error instanceof Error && error.message.includes("transaction")) {
          throw new Error(
            "Failed to build deployment transaction. Please try again."
          );
        }
        throw new Error("Failed to prepare deployment. Please try again.");
      }
    }),

  confirmDeploy: authedProcedure
    .input(
      z.object({
        id: z.string(),
        poolAddress: solanaAddress,
        tokenMint: solanaAddress,
        signature: z.string().min(1).max(128),
      })
    )
    .handler(async ({ input, context }) => {
      try {
        const existing = await getLaunchByOwner(input.id, context.user.id);
        if (!existing) {
          throw new NotFoundError("Launch");
        }
        if (existing.status !== "pending") {
          throw new ConflictError("This launch has already been deployed");
        }

        const exists = await verifyPoolCreated(input.poolAddress);
        if (!exists) {
          throw new ValidationError(
            "Pool not found on-chain. Please verify the transaction was successful."
          );
        }

        await db
          .update(launch)
          .set({
            poolAddress: input.poolAddress,
            tokenMint: input.tokenMint,
            status: "active",
          })
          .where(eq(launch.id, input.id));

        return { success: true, poolAddress: input.poolAddress };
      } catch (error) {
        if (
          error instanceof NotFoundError ||
          error instanceof ConflictError ||
          error instanceof ValidationError
        ) {
          throw error;
        }
        throw new Error("Failed to confirm deployment. Please try again.");
      }
    }),

  recoverDeploy: authedProcedure
    .input(
      z.object({
        id: z.string(),
        poolAddress: solanaAddress,
        tokenMint: solanaAddress,
      })
    )
    .handler(async ({ input, context }) => {
      try {
        const existing = await getLaunchByOwner(input.id, context.user.id);
        if (!existing) {
          throw new NotFoundError("Launch");
        }
        if (existing.status !== "pending") {
          return { success: true, alreadyActive: true };
        }

        const exists = await verifyPoolCreated(input.poolAddress, 3, 1000);
        if (!exists) {
          return { success: false };
        }

        await db
          .update(launch)
          .set({
            poolAddress: input.poolAddress,
            tokenMint: input.tokenMint,
            status: "active",
          })
          .where(eq(launch.id, input.id));

        return { success: true, recovered: true };
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new Error("Failed to recover deployment. Please try again.");
      }
    }),
};
