import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { launch } from "@/lib/db/auth-schema";
import { authedProcedure } from "../procedures";

const curvePresetSchema = z.enum(["community", "standard", "scarce"]);

export const launchRouter = {
  list: authedProcedure.handler(async ({ context }) => {
    return db
      .select()
      .from(launch)
      .where(eq(launch.creatorId, context.user.id))
      .orderBy(desc(launch.createdAt));
  }),

  get: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await db
        .select()
        .from(launch)
        .where(
          and(eq(launch.id, input.id), eq(launch.creatorId, context.user.id))
        )
        .limit(1);
      if (!result[0]) {
        throw new Error("Launch not found");
      }
      return result[0];
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        symbol: z.string().min(1).max(10).toUpperCase(),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        curvePreset: curvePresetSchema,
        charityWallet: z.string().min(32).max(44),
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const id = crypto.randomUUID();
      await db.insert(launch).values({
        id,
        creatorId: context.user.id,
        name: input.name,
        symbol: input.symbol,
        description: input.description,
        image: input.image,
        curvePreset: input.curvePreset,
        charityWallet: input.charityWallet,
        charityName: input.charityName,
        status: "pending",
      });
      return { id };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        symbol: z.string().min(1).max(10).toUpperCase().optional(),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        curvePreset: curvePresetSchema.optional(),
        charityWallet: z.string().min(32).max(44).optional(),
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;
      const existing = await db
        .select()
        .from(launch)
        .where(and(eq(launch.id, id), eq(launch.creatorId, context.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new Error("Launch not found");
      }
      if (existing[0].status !== "pending") {
        throw new Error("Cannot update deployed launch");
      }

      await db.update(launch).set(updates).where(eq(launch.id, id));
      return { success: true };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const existing = await db
        .select()
        .from(launch)
        .where(
          and(eq(launch.id, input.id), eq(launch.creatorId, context.user.id))
        )
        .limit(1);

      if (!existing[0]) {
        throw new Error("Launch not found");
      }
      if (existing[0].status !== "pending") {
        throw new Error("Cannot delete deployed launch");
      }

      await db.delete(launch).where(eq(launch.id, input.id));
      return { success: true };
    }),
};
