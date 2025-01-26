import pino from "pino";
import { env } from "~/env";

export function getLogger(component: string) {
  const logger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
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
