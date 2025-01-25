import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { EMOTION_TAGS } from "../src/constants/emotions";

const prisma = new PrismaClient();

async function main() {
  // 感情タグのデータを作成
  const emotionTags = await Promise.all(
    EMOTION_TAGS.map((tag) =>
      prisma.emotionTag.create({
        data: {
          name: tag.name,
        },
      }),
    ),
  );

  if (!emotionTags[3] || !emotionTags[5] || !emotionTags[1]) {
    throw new Error("Failed to create emotion tags");
  }

  // 投稿データを作成
  await Promise.all([
    prisma.post.create({
      data: {
        content: "今日は晴れて気持ちがいい一日でした！",
        emotionTagId: emotionTags[3].id, // 喜び
        anonymousId: uuidv4(),
      },
    }),
    prisma.post.create({
      data: {
        content: "友達と遊園地に行って楽しかった！",
        emotionTagId: emotionTags[5].id, // 楽しい
        anonymousId: uuidv4(),
      },
    }),
    prisma.post.create({
      data: {
        content: "大切なものをなくしてしまった...",
        emotionTagId: emotionTags[1].id, // 悲しみ
        anonymousId: uuidv4(),
      },
    }),
  ]);

  console.log("シードデータの作成が完了しました");
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
