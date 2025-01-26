"use client";

import pino from "pino";

interface LogObject {
  level: number | string;
  msg: string;
  component?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_MAP: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

function formatLog(obj: LogObject): string {
  const now = new Date();
  const timestamp = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    timeZone: "Asia/Tokyo",
  });
  const level =
    typeof obj.level === "number"
      ? (LOG_LEVEL_MAP[obj.level] ?? "unknown")
      : obj.level;
  return `[${timestamp} ${obj.component}] ${level.toUpperCase()}: ${obj.msg}`;
}

// クライアントサイドでのみロガーを初期化
const createLogger = () => {
  if (typeof window === "undefined") {
    // サーバーサイドでは空の関数を返す
    // SSR時にクライアントのコードがサーバで実行されるため、それをターミナルに出力しないようにする
    const noop = () => undefined;
    return {
      info: noop,
      error: noop,
      debug: noop,
      warn: noop,
      child: () => ({
        info: noop,
        error: noop,
        debug: noop,
        warn: noop,
      }),
    };
  }

  return pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    browser: {
      write: (o) => {
        const formatted = formatLog(o as LogObject);
        console.log(formatted);
      },
    },
  });
};

export const logger = createLogger();

export const loggerWithName = (name: string) =>
  logger.child({
    component: name,
  });
