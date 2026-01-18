import { CURVE_PRESETS, FEE_DISTRIBUTION } from "@/lib/dbc";
import { publicProcedure } from "../procedures";

export const configRouter = {
  curvePresets: publicProcedure.handler(() => {
    return Object.entries(CURVE_PRESETS).map(([key, preset]) => ({
      id: key,
      ...preset,
    }));
  }),

  feeDistribution: publicProcedure.handler(() => {
    return FEE_DISTRIBUTION;
  }),
};
