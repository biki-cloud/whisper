import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: "./",
});

// Jestのカスタム設定を設置する場所
const config: Config = {
  // テストの際に使用する環境を指定
  testEnvironment: "jest-environment-jsdom",
  // テスト対象から除外するディレクトリを指定
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  // テストファイルのパターンを指定
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  // TypeScriptのパスエイリアスを解決するための設定
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

// createJestConfigを定義することによって、本ファイルで定義された設定がNext.jsの設定に反映される
export default createJestConfig(config);
