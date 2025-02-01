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
  db: prismaMock,
}));

// scrollIntoViewのモック
Element.prototype.scrollIntoView = jest.fn();

// superjsonのモック
jest.mock("superjson", () => {
  const actual = jest.requireActual("identity-obj-proxy");
  return {
    ...actual,
    stringify: jest.fn((obj) => JSON.stringify(obj)),
    parse: jest.fn((str) => JSON.parse(str)),
    registerClass: jest.fn(),
    registerSymbol: jest.fn(),
    registerCustom: jest.fn(),
  };
});
