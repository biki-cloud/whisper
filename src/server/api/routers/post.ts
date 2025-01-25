import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        emotionTagId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 現在の日付の開始時刻（00:00:00）を取得（日本時間）
      const now = new Date();
      const jstOffset = 9 * 60; // UTC+9の分単位のオフセット
      const today = new Date(now.getTime() + jstOffset * 60 * 1000);
      today.setHours(0, 0, 0, 0);
      today.setTime(today.getTime() - jstOffset * 60 * 1000); // UTCに戻す

      // 明日の開始時刻（00:00:00）を取得
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 同じ匿名IDからの当日の投稿をチェック
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
              anonymousId: ctx.anonymousId,
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

      // 同じ日に削除した投稿があるかチェック
      const deletedPosts = await ctx.db.deletedPost.findMany({
        where: {
          AND: [
            {
              deletedAt: {
                gte: today,
                lt: tomorrow,
              },
            },
            {
              anonymousId: ctx.anonymousId,
            },
          ],
        },
        take: 1,
      });

      if (deletedPosts.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "投稿を削除した同じ日には再投稿できません。",
        });
      }

      // 投稿を作成
      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          emotionTagId: input.emotionTagId,
          anonymousId: ctx.anonymousId,
        },
        include: {
          emotionTag: true,
          stamps: true,
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

      // 今日の投稿のみを取得（日本時間）
      const now = new Date();
      const jstOffset = 9 * 60; // UTC+9の分単位のオフセット

      // 日本時間の0時0分0秒を取得
      const today = new Date(now.getTime() + jstOffset * 60 * 1000);
      today.setHours(0, 0, 0, 0);
      today.setTime(today.getTime() - jstOffset * 60 * 1000); // UTCに戻す

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
          stamps: true,
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

  addStamp: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        type: z.string(),
        native: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        // 投稿の存在確認と既存のスタンプを一度に取得
        const post = await tx.post.findUnique({
          where: { id: input.postId },
          include: {
            emotionTag: true,
            stamps: {
              where: {
                type: input.type,
                anonymousId: ctx.anonymousId,
              },
            },
          },
        });

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "投稿が見つかりません",
          });
        }

        const existingStamp = post.stamps[0];

        if (existingStamp) {
          // 既存のスタンプが存在する場合は削除
          await tx.stamp.delete({
            where: {
              id: existingStamp.id,
            },
          });
        } else {
          // スタンプが存在しない場合は新規作成
          await tx.stamp.create({
            data: {
              postId: input.postId,
              type: input.type,
              native: input.native,
              anonymousId: ctx.anonymousId,
            },
          });
        }

        // 更新された投稿を返す（トランザクション内で取得）
        return await tx.post.findUnique({
          where: { id: input.postId },
          include: {
            emotionTag: true,
            stamps: true,
          },
        });
      });
    }),

  getClientId: publicProcedure.query(({ ctx }) => {
    return ctx.anonymousId;
  }),

  delete: publicProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 投稿の存在確認と所有権チェック
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "投稿が見つかりません",
        });
      }

      if (post.anonymousId !== ctx.anonymousId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "この投稿を削除する権限がありません",
        });
      }

      // 関連するスタンプを先に削除
      await ctx.db.stamp.deleteMany({
        where: { postId: input.postId },
      });

      // 削除記録を作成
      await ctx.db.deletedPost.create({
        data: {
          anonymousId: ctx.anonymousId,
        },
      });

      // 投稿を削除
      await ctx.db.post.delete({
        where: { id: input.postId },
      });

      return { success: true };
    }),

  getAllPosts: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany({
      include: {
        emotionTag: true,
        stamps: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
