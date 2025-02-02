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

// env.jsのモック
jest.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-key",
    DATABASE_URL: "test-database-url",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "test-clerk-key",
    CLERK_SECRET_KEY: "test-clerk-secret",
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/",
  },
}));

// web-pushのモック
jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
  generateVAPIDKeys: jest.fn(),
}));
