import pino from "pino";

export function getLogger(component: string) {
  // テスト環境では簡易的なロガー設定を使用
  if (process.env.NODE_ENV === "test") {
    const logger = pino({
      level: "silent",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname,component",
          messageFormat: "{component} | {msg}",
        },
      },
    });
    return logger.child({ component });
  }

  const logger = pino({
    // ここでenv.NODE_ENVを使うとなぜかjest oss-env系のエラーになるため、直
    // 本来はこうしたい：level: env.NODE_ENV === "production" ? "info" : "debug",
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
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  });
  const child = logger.child({ component: component });
  return child;
}
