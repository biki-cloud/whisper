import { type inferProcedureInput } from "@trpc/server";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter, type AppRouter } from "~/server/api/root";
import { prismaMock } from "../../setup";
import { TRPCError } from "@trpc/server";

describe("Post Router", () => {
  const anonymousId = "test-anonymous-id";
  let ctx: Awaited<ReturnType<typeof createTRPCContext>>;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    ctx = await createTRPCContext({ headers: { get: () => anonymousId } });
    caller = appRouter.createCaller(ctx);
  });

  describe("create", () => {
    type Input = inferProcedureInput<AppRouter["post"]["create"]>;
    const defaultInput: Input = {
      content: "Test post",
      emotionTagId: "test-emotion-tag-id",
    };

    it("should create a post successfully", async () => {
      const mockPost = {
        id: "test-post-id",
        content: defaultInput.content,
        emotionTagId: defaultInput.emotionTagId,
        anonymousId,
        createdAt: new Date(),
        emotionTag: {
          id: defaultInput.emotionTagId,
          name: "Test Emotion",
        },
        stamps: [],
      };

      // 既存の投稿がないことを確認
      prismaMock.post.findMany.mockResolvedValueOnce([]);
      // 削除された投稿がないことを確認
      prismaMock.deletedPost.findMany.mockResolvedValueOnce([]);
      // 新規投稿の作成
      prismaMock.post.create.mockResolvedValueOnce(mockPost);

      const result = await caller.post.create(defaultInput);
      expect(result).toEqual(mockPost);
    });

    it("should throw error if user already posted today", async () => {
      const existingPost = {
        id: "existing-post-id",
        content: "Existing post",
        emotionTagId: "test-emotion-tag-id",
        anonymousId,
        createdAt: new Date(),
      };

      prismaMock.post.findMany.mockResolvedValueOnce([existingPost]);

      await expect(caller.post.create(defaultInput)).rejects.toThrow(
        new TRPCError({
          code: "FORBIDDEN",
          message: "1日1回までしか投稿できません。",
        }),
      );
    });

    it("should throw error if user deleted a post today", async () => {
      prismaMock.post.findMany.mockResolvedValueOnce([]);
      prismaMock.deletedPost.findMany.mockResolvedValueOnce([
        {
          id: "deleted-post-id",
          anonymousId,
          deletedAt: new Date(),
        },
      ]);

      await expect(caller.post.create(defaultInput)).rejects.toThrow(
        new TRPCError({
          code: "FORBIDDEN",
          message: "投稿を削除した同じ日には再投稿できません。",
        }),
      );
    });
  });

  describe("getAll", () => {
    type Input = inferProcedureInput<AppRouter["post"]["getAll"]>;
    const defaultInput: Input = {
      limit: 10,
      orderBy: "desc",
    };

    it("should return posts with pagination", async () => {
      const mockPosts = Array.from({ length: 11 }, (_, i) => ({
        id: `post-${i}`,
        content: `Post ${i}`,
        emotionTagId: "emotion-1",
        createdAt: new Date(),
        anonymousId: `user-${i}`,
        emotionTag: {
          id: "emotion-1",
          name: "Happy",
        },
        stamps: [],
      }));

      prismaMock.post.findMany.mockResolvedValueOnce(mockPosts);

      const result = await caller.post.getAll(defaultInput);
      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBe("post-10");
    });

    it("should filter by emotionTagId", async () => {
      const emotionTagId = "emotion-1";
      const mockPosts = [
        {
          id: "post-1",
          content: "Post 1",
          emotionTagId,
          createdAt: new Date(),
          anonymousId: "user-1",
          emotionTag: {
            id: emotionTagId,
            name: "Happy",
          },
          stamps: [],
        },
      ];

      prismaMock.post.findMany.mockResolvedValueOnce(mockPosts);

      const result = await caller.post.getAll({
        ...defaultInput,
        emotionTagId,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.emotionTag?.id).toBe(emotionTagId);
    });
  });

  describe("addStamp", () => {
    type Input = inferProcedureInput<AppRouter["post"]["addStamp"]>;
    const defaultInput: Input = {
      postId: "test-post-id",
      type: "👍",
      native: "👍",
    };

    it("should add stamp if not exists", async () => {
      const mockPost = {
        id: defaultInput.postId,
        content: "Test post",
        emotionTagId: "emotion-1",
        createdAt: new Date(),
        anonymousId: "post-author",
        emotionTag: {
          id: "emotion-1",
          name: "Happy",
        },
      };

      const mockStamp = {
        id: "stamp-1",
        postId: defaultInput.postId,
        type: defaultInput.type,
        native: defaultInput.native,
        anonymousId,
        createdAt: new Date(),
      };

      prismaMock.$transaction.mockImplementationOnce(async (callback: any) => {
        prismaMock.stamp.findFirst.mockResolvedValueOnce(null);
        prismaMock.stamp.create.mockResolvedValueOnce(mockStamp);
        prismaMock.stamp.findMany.mockResolvedValueOnce([mockStamp]);
        prismaMock.post.findUniqueOrThrow.mockResolvedValueOnce(mockPost);
        return callback(prismaMock);
      });

      const result = await caller.post.addStamp(defaultInput);
      expect(result.stamps).toHaveLength(1);
      expect(result.stamps[0]).toEqual(mockStamp);
    });

    it("should remove stamp if exists", async () => {
      const existingStamp = {
        id: "existing-stamp-id",
        postId: defaultInput.postId,
        type: defaultInput.type,
        native: defaultInput.native,
        anonymousId,
        createdAt: new Date(),
      };

      const mockPost = {
        id: defaultInput.postId,
        content: "Test post",
        emotionTagId: "emotion-1",
        createdAt: new Date(),
        anonymousId: "post-author",
        emotionTag: {
          id: "emotion-1",
          name: "Happy",
        },
      };

      prismaMock.$transaction.mockImplementationOnce(async (callback: any) => {
        prismaMock.stamp.findFirst.mockResolvedValueOnce(existingStamp);
        prismaMock.stamp.delete.mockResolvedValueOnce(existingStamp);
        prismaMock.stamp.findMany.mockResolvedValueOnce([]);
        prismaMock.post.findUniqueOrThrow.mockResolvedValueOnce(mockPost);
        return callback(prismaMock);
      });

      const result = await caller.post.addStamp(defaultInput);
      expect(result.stamps).toHaveLength(0);
    });
  });

  describe("getClientId", () => {
    it("should return anonymousId", async () => {
      const result = await caller.post.getClientId();
      expect(result).toBe(anonymousId);
    });
  });
});
