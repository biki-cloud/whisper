"use client";

import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  browser: {
    asObject: true,
    write: {
      info: (o) => console.info(o),
      error: (o) => console.error(o),
      debug: (o) => console.debug(o),
      warn: (o) => console.warn(o),
    },
  },
});

export const loggerWithName = (name: string) =>
  logger.child({
    name,
  });
