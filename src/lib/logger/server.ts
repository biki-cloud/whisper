import pino from "pino";
import { env } from "~/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        },
  browser: {
    write(o) {
      console.log(o);
    },
  },
});

export const loggerWithName = (name: string) =>
  logger.child({
    name,
  });
