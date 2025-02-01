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
    "^~/(.*)$": "<rootDir>/src/$1",
    "^superjson$": "identity-obj-proxy",
  },
  // セットアップファイルを指定
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  // ESModulesの設定
  transformIgnorePatterns: [
    "node_modules/(?!(@trpc|superjson|lucide-react|@radix-ui|@babel|@floating-ui|framer-motion|@emoji-mart)/)",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
          },
          target: "es2020",
        },
        module: {
          type: "commonjs",
          noInterop: false,
        },
      },
    ],
    "^.+\\.m?js$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: false,
          },
          transform: null,
          target: "es2020",
        },
        module: {
          type: "commonjs",
          noInterop: false,
        },
      },
    ],
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  resolver: undefined,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "json-summary"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
    "!src/**/_*.{js,jsx,ts,tsx}",
  ],
};

// createJestConfigを定義することによって、本ファイルで定義された設定がNext.jsの設定に反映される
export default createJestConfig(config);
