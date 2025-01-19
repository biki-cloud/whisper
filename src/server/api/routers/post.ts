import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        emotionTagId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return ctx.db.post.create({
        data: {
          content: input.content,
          emotionTagId: input.emotionTagId,
          expiresAt,
        },
        include: {
          emotionTag: true,
          empathies: true,
        },
      });
    }),

  getRandom: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const posts = await ctx.db.post.findMany({
      where: {
        expiresAt: {
          gte: now,
        },
      },
      include: {
        emotionTag: true,
        empathies: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return posts.sort(() => Math.random() - 0.5);
  }),

  addEmpathy: publicProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return ctx.db.empathy.create({
        data: {
          postId: input.postId,
        },
      });
    }),
});
