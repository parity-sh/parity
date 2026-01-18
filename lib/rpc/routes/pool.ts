import { z } from "zod";
import { publicProcedure } from "../procedures";

export const poolRouter = {
  info: publicProcedure
    .input(z.object({ poolAddress: z.string() }))
    .handler(({ input }) => {
      // TODO: Implement actual pool fetching from DBC SDK
      return {
        address: input.poolAddress,
        status: "not_implemented",
        message: "Pool info fetching will be implemented with DBC SDK",
      };
    }),
};
