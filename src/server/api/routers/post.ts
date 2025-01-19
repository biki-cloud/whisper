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

      // 投稿を作成
      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          emotionTagId: input.emotionTagId,
          ipAddress: ctx.ip,
        },
        include: {
          emotionTag: true,
          empathies: true,
        },
      });

      return post;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        emotionTagId: z.string().optional(),
        orderBy: z.enum(["desc", "asc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, emotionTagId, orderBy } = input;

      const where: Prisma.PostWhereInput = {};

      // 感情タグでフィルター
      if (emotionTagId) {
        where.emotionTagId = emotionTagId;
      }

      // 今日の投稿のみを取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      where.createdAt = {
        gte: today,
        lt: tomorrow,
      };

      // カーソルベースのページネーション
      const items = await ctx.db.post.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          emotionTag: true,
          empathies: true,
        },
        orderBy: {
          createdAt: orderBy,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  addEmpathy: publicProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        include: {
          emotionTag: true,
          empathies: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      await ctx.db.empathy.create({
        data: {
          postId: input.postId,
        },
      });

      return post;
    }),
});
