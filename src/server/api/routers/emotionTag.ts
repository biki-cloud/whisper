import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const emotionTagRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.EmotionTag.findMany();
  }),
});
