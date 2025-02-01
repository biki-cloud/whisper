import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { prismaMock } from "../../setup";

describe("EmotionTag Router", () => {
  const anonymousId = "test-anonymous-id";
  let ctx: Awaited<ReturnType<typeof createTRPCContext>>;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    ctx = await createTRPCContext({ headers: { get: () => anonymousId } });
    caller = appRouter.createCaller(ctx);
  });

  describe("getAll", () => {
    it("should return all emotion tags", async () => {
      const mockEmotionTags = [
        { id: "emotion-1", name: "Happy" },
        { id: "emotion-2", name: "Sad" },
        { id: "emotion-3", name: "Angry" },
      ];

      prismaMock.emotionTag.findMany.mockResolvedValueOnce(mockEmotionTags);

      const result = await caller.emotionTag.getAll();
      expect(result).toEqual(mockEmotionTags);
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no emotion tags exist", async () => {
      prismaMock.emotionTag.findMany.mockResolvedValueOnce([]);

      const result = await caller.emotionTag.getAll();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
