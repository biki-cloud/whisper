import { PrismaClient } from "@prisma/client";
import { seedEmotionTags } from "./seeds/required/seed_emotion_tags";
import { seedPosts } from "./seeds/samples/seed_posts";

const prisma = new PrismaClient();

async function main() {
  const seedType = process.env.SEED_TYPE ?? "all";

  if (seedType === "required" || seedType === "all") {
    // 必須の感情タグデータを作成
    const emotionTags = await seedEmotionTags(prisma);
    console.log("Required seeds completed");

    // サンプルデータを作成する場合
    if (seedType === "all" && process.env.NODE_ENV !== "production") {
      await seedPosts(prisma, emotionTags);
      console.log("Sample seeds completed");
    }
  } else if (seedType === "samples" && process.env.NODE_ENV !== "production") {
    // サンプルデータのみ作成する場合は、既存の感情タグを取得
    const emotionTags = await prisma.emotionTag.findMany();
    await seedPosts(prisma, emotionTags);
    console.log("Sample seeds completed");
  }
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
