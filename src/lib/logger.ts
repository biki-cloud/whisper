import { env } from "@/env";

type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isEnabled: boolean;

  constructor() {
    // development または test 環境でのみ有効
    this.isEnabled = env.NODE_ENV !== "production";
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "debug":
        console.debug(prefix, ...args);
        break;
      case "info":
        console.info(prefix, ...args);
        break;
      case "warn":
        console.warn(prefix, ...args);
        break;
      case "error":
        console.error(prefix, ...args);
        break;
    }
  }

  debug(...args: unknown[]): void {
    this.log("debug", ...args);
  }

  info(...args: unknown[]): void {
    this.log("info", ...args);
  }

  warn(...args: unknown[]): void {
    this.log("warn", ...args);
  }

  error(...args: unknown[]): void {
    this.log("error", ...args);
  }
}

export const logger = new Logger();
