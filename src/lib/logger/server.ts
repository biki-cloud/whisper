import pino from "pino";

export function getLogger(component: string) {
  // テスト環境では簡易的なロガー設定を使用
  if (process.env.NODE_ENV === "test") {
    const logger = pino({
      level: "silent",
    });
    return logger.child({ component });
  }

  // 開発環境では pino-pretty を使用
  if (process.env.NODE_ENV === "development") {
    const logger = pino({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname,component",
          messageFormat: "{component} | {msg}",
        },
      },
    });
    return logger.child({ component });
  }

  // 本番環境では基本的なpinoロガーを使用
  const logger = pino({
    level: "info",
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  });
  return logger.child({ component });
}
