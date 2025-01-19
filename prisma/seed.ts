import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emotionTags = [
    { name: "嬉しい" },
    { name: "楽しい" },
    { name: "悲しい" },
    { name: "怒り" },
    { name: "不安" },
    { name: "安心" },
    { name: "感謝" },
    { name: "後悔" },
    { name: "期待" },
    { name: "寂しい" },
  ];

  for (const tag of emotionTags) {
    await prisma.emotionTag.create({
      data: tag,
    });
  }

  console.log("感情タグの初期データを投入しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
