import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Post = RouterOutputs["post"]["getAll"]["items"][number];

export type EmotionTag = RouterOutputs["emotionTag"]["getAll"][number];
export type GetAllPostsResponse = RouterOutputs["post"]["getAll"];
