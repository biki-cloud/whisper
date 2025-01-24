import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "~/server/api/root";
import { getUrl } from "./shared";
import { getOrCreateAnonymousId } from "~/utils/anonymousId";

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === "development",
        }),
        httpBatchLink({
          url: getUrl(),
          headers() {
            return {
              "x-anonymous-id": getOrCreateAnonymousId(),
            };
          },
          transformer: superjson,
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs["example"]["hello"]
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs["example"]["hello"]
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
