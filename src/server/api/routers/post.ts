import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma, type Post } from "@prisma/client";
import { randomUUID } from "crypto";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        emotionTagId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 現在の日付の開始時刻（00:00:00）を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 明日の開始時刻（00:00:00）を取得
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 同じIPアドレスからの当日の投稿をチェック
      const existingPosts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: today,
                lt: tomorrow,
              },
            },
            {
              ipAddress: ctx.ip,
            },
          ],
        },
        take: 1,
      });

      if (existingPosts.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "1日1回までしか投稿できません。",
        });
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 投稿を作成
      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          emotionTagId: input.emotionTagId,
          expiresAt,
          ipAddress: ctx.ip,
        },
        include: {
          emotionTag: true,
          empathies: true,
        },
      });

      return post;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    return ctx.db.post.findMany({
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

      return post;
    }),
});
