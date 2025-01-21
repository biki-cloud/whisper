import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type Prisma } from "@prisma/client";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Post = Prisma.PostGetPayload<{
  include: {
    emotionTag: true;
    stamps: true;
  };
}>;

export type EmotionTag = RouterOutputs["emotionTag"]["getAll"][number];
export type GetAllPostsResponse = RouterOutputs["post"]["getAll"];
