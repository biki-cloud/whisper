import type { PrismaClient, EmotionTag } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function seedPosts(
  prisma: PrismaClient,
  emotionTags: EmotionTag[],
) {
  const findTagByName = (name: string) => {
    const tag = emotionTags.find((t) => t.name === name);
    if (!tag) throw new Error(`Emotion tag "${name}" not found`);
    return tag;
  };

  await Promise.all([
    prisma.post.create({
      data: {
        content: "今日は晴れて気持ちがいい一日でした！",
        emotionTagId: findTagByName("喜び").id,
        anonymousId: uuidv4(),
      },
    }),
    prisma.post.create({
      data: {
        content: "友達と遊園地に行って楽しかった！",
        emotionTagId: findTagByName("楽しい").id,
        anonymousId: uuidv4(),
      },
    }),
    prisma.post.create({
      data: {
        content: "大切なものをなくしてしまった...",
        emotionTagId: findTagByName("悲しみ").id,
        anonymousId: uuidv4(),
      },
    }),
  ]);
}
