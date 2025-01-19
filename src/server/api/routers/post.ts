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
      const existingPosts = await ctx.db.$queryRaw<Post[]>`
        SELECT * FROM "Post"
        WHERE "ipAddress" = ${ctx.ip}
        AND "createdAt" >= ${today}
        AND "createdAt" < ${tomorrow}
        LIMIT 1
      `;

      if (existingPosts.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "1日1回までしか投稿できません。",
        });
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 投稿を作成
      const post = await ctx.db.$executeRaw`
        INSERT INTO "Post" ("id", "content", "emotionTagId", "expiresAt", "ipAddress", "createdAt")
        VALUES (
          ${randomUUID()},
          ${input.content},
          ${input.emotionTagId},
          ${expiresAt},
          ${ctx.ip},
          ${new Date()}
        )
        RETURNING *
      `;

      // 作成した投稿を関連データと共に取得
      return ctx.db.$queryRaw<(Post & { emotionTag: any; empathies: any[] })[]>`
        SELECT p.*, 
          json_build_object('id', et.id, 'name', et.name) as "emotionTag",
          COALESCE(
            (
              SELECT json_agg(e.*)
              FROM "Empathy" e
              WHERE e."postId" = p.id
            ),
            '[]'
          ) as empathies
        FROM "Post" p
        LEFT JOIN "EmotionTag" et ON et.id = p."emotionTagId"
        WHERE p.id = ${randomUUID()}
        LIMIT 1
      `;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    return ctx.db.$queryRaw<(Post & { emotionTag: any; empathies: any[] })[]>`
      SELECT p.*, 
        json_build_object('id', et.id, 'name', et.name) as "emotionTag",
        COALESCE(
          (
            SELECT json_agg(e.*)
            FROM "Empathy" e
            WHERE e."postId" = p.id
          ),
          '[]'
        ) as empathies
      FROM "Post" p
      LEFT JOIN "EmotionTag" et ON et.id = p."emotionTagId"
      WHERE p."expiresAt" >= ${now}
      ORDER BY p."createdAt" DESC
      LIMIT 10
    `;
  }),

  addEmpathy: publicProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.$queryRaw<Post[]>`
        SELECT * FROM "Post"
        WHERE id = ${input.postId}
        LIMIT 1
      `;

      if (post.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return ctx.db.$executeRaw`
        INSERT INTO "Empathy" ("id", "postId", "createdAt")
        VALUES (${randomUUID()}, ${input.postId}, ${new Date()})
      `;
    }),
});
