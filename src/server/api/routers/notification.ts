import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  savePushSubscription: publicProcedure
    .input(
      z.object({
        subscription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pushSubscription.upsert({
        where: {
          anonymousId: ctx.anonymousId,
        },
        create: {
          anonymousId: ctx.anonymousId,
          subscription: input.subscription,
        },
        update: {
          subscription: input.subscription,
        },
      });
    }),

  deletePushSubscription: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.db.pushSubscription.delete({
      where: {
        anonymousId: ctx.anonymousId,
      },
    });
  }),
});
