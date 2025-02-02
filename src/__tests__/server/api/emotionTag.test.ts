import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
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
    it("should return emotion tags", async () => {
      const mockEmotionTags = [
        {
          id: "1",
          name: "happy",
        },
        {
          id: "2",
          name: "sad",
        },
      ];

      prismaMock.emotionTag.findMany.mockResolvedValueOnce(mockEmotionTags);

      const result = await caller.emotionTag.getAll();
      expect(result).toEqual(mockEmotionTags);
    });
  });
});
