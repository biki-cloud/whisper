import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        emotionTagId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 24時間後の日時を計算
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 投稿を作成
      const post = await ctx.db.post.create({
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

      return post;
    }),

  getRandom: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    // 有効期限内の投稿をランダムに10件取得
    const posts = await ctx.db.post.findMany({
      where: {
        expiresAt: {
          gt: now,
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

    // 投稿をランダムにシャッフル
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

      const empathy = await ctx.db.empathy.create({
        data: {
          postId: input.postId,
        },
      });

      return empathy;
    }),
});
