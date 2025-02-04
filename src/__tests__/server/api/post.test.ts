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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    type Input = inferProcedureInput<AppRouter["post"]["create"]>;
    const defaultInput: Input = {
      content: "test message",
      emotionTagId: "test-emotion-id",
    };

    it("should create a post", async () => {
      const mockPost = {
        id: "test-post-id",
        content: defaultInput.content,
        emotionTagId: defaultInput.emotionTagId,
        anonymousId: "test-anonymous-id",
        createdAt: new Date(),
        emotionTag: {
          id: defaultInput.emotionTagId,
          name: "Test Emotion",
        },
        stamps: [],
      };

      prismaMock.post.findMany.mockResolvedValueOnce([]);
      prismaMock.deletedPost.findMany.mockResolvedValueOnce([]);
      prismaMock.post.create.mockResolvedValueOnce(mockPost);

      const result = await caller.post.create(defaultInput);
      expect(result.id).toBeDefined();
      expect(result.content).toBe(defaultInput.content);
      expect(result.emotionTag.id).toBe(defaultInput.emotionTagId);
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
    it("should return posts", async () => {
      const mockPosts = [
        {
          id: "test-post-id",
          content: "test message",
          emotionTagId: "test-emotion-id",
          createdAt: new Date(),
          anonymousId: "test-anonymous-id",
          emotionTag: {
            id: "test-emotion-id",
            name: "Test Emotion",
          },
          stamps: [],
        },
      ];

      prismaMock.post.findMany.mockResolvedValueOnce(mockPosts);

      const result = await caller.post.getAll({
        limit: 10,
        cursor: null,
      });

      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(1);
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
        limit: 10,
        cursor: null,
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

  describe("delete", () => {
    it("should delete a post", async () => {
      const mockPost = {
        id: "test-post-id",
        content: "test message",
        emotionTagId: "test-emotion-id",
        anonymousId: ctx.anonymousId,
        createdAt: new Date(),
      };

      prismaMock.post.findUnique.mockResolvedValueOnce(mockPost);
      prismaMock.stamp.deleteMany.mockResolvedValueOnce({ count: 0 });
      prismaMock.deletedPost.create.mockResolvedValueOnce({
        id: "test-deleted-id",
        anonymousId: ctx.anonymousId,
        deletedAt: new Date(),
      });
      prismaMock.post.delete.mockResolvedValueOnce(mockPost);

      const result = await caller.post.delete({
        postId: "test-post-id",
      });

      expect(result.success).toBe(true);
    });
  });
});
