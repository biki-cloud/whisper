import { type Prisma } from "@prisma/client";
import type { RouterOutputs } from "./api";

export type Post = Prisma.PostGetPayload<{
  include: {
    emotionTag: true;
    stamps: true;
  };
}>;

export type Stamp = Post["stamps"][number];

export interface AggregatedStamp {
  type: string;
  count: number;
  stamps: Stamp[];
}

export type EmotionTag = RouterOutputs["emotionTag"]["getAll"][number];

export interface PostFormData {
  content: string;
  emotionTagId: string;
}

export interface PostFormState {
  content: string;
  emotionTagId: string;
  isSubmitting: boolean;
  error: string | null;
}

export type PostWithRelations = {
  id: string;
  content: string;
  createdAt: Date;
  emotionTagId: string;
  anonymousId: string;
  emotionTag: {
    id: string;
    name: string;
  };
  stamps: Array<{
    id: string;
    type: string;
    anonymousId: string;
    postId: string;
    createdAt: Date;
    native: string;
  }>;
};
