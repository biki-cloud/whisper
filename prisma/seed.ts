import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    const sqlFile = readFileSync(join(__dirname, "seed.sql"), "utf8");
    const statements = sqlFile
      .split(";")
      .filter((statement) => statement.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement + ";");
      }
    }

    console.log("Seed data has been successfully inserted");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
