import { PrismaClient } from "@prisma/client";
import { env } from "~/env";
import { logger } from "~/lib/logger/server";

const prismaLogger = logger.child({ component: "PrismaLogger" });

const createPrismaClient = () =>
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

function bindParamsToQuery(query: string, params: string): string {
  try {
    const parameters: Array<string | number | boolean | Date> =
      JSON.parse(params);
    let boundQuery = query;

    parameters.forEach(
      (param: string | number | boolean | Date, index: number) => {
        const placeholder = `$${index + 1}`;
        const stringValue =
          typeof param === "string"
            ? param
            : param instanceof Date
              ? param.toISOString()
              : String(param);
        boundQuery = boundQuery.replace(placeholder, `'${stringValue}'`);
      },
    );

    return boundQuery;
  } catch (error) {
    return `Error binding params: ${String(error)}`;
  }
}

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  db.$on("query", (e) => {
    // e.queryが"COMMIT, BEGIN, "DEALLOCATE ALL"のような場合はログに出力しない
    if (!/^(COMMIT|BEGIN|DEALLOCATE ALL|SELECT 1)/.test(e.query)) {
      prismaLogger.debug("Query: " + bindParamsToQuery(e.query, e.params));
    }
  });
}
