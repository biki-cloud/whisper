import type { PrismaClient } from "@prisma/client";
import { EMOTION_TAGS } from "../../../src/constants/emotions";

export async function seedEmotionTags(prisma: PrismaClient) {
  const existingTags = await prisma.emotionTag.findMany();
  const existingTagNames = new Set(existingTags.map((tag) => tag.name));

  const newTags = EMOTION_TAGS.filter((tag) => !existingTagNames.has(tag.name));

  const emotionTags = await Promise.all(
    newTags.map((tag) =>
      prisma.emotionTag.create({
        data: {
          name: tag.name,
        },
      }),
    ),
  );

  console.log(`Created ${emotionTags.length} new emotion tags`);
  return [...existingTags, ...emotionTags];
}
