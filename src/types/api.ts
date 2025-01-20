import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  emotionTagId: string;
  ipAddress: string;
  emotionTag: {
    id: string;
    name: string;
  };
  empathies: {
    id: string;
    postId: string;
    createdAt: Date;
  }[];
  stamps: {
    id: string;
    type: string;
    postId: string;
    createdAt: Date;
    ipAddress: string;
  }[];
};

export type EmotionTag = RouterOutputs["emotionTag"]["getAll"][number];
export type GetAllPostsResponse = RouterOutputs["post"]["getAll"];
