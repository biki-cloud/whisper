import "@testing-library/jest-dom";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";

// Prismaのモックを作成
export const prismaMock = mockDeep<PrismaClient>();

// 各テストの前にモックをリセット
beforeEach(() => {
  mockReset(prismaMock);
});

// グローバルなPrismaモックを設定
jest.mock("~/server/db", () => ({
  prisma: prismaMock,
}));
