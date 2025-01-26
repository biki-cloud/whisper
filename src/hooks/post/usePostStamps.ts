"use client";

import { useCallback } from "react";
import { api } from "~/utils/api";
import { useClientId } from "~/hooks/useClientId";
import type { RouterOutputs } from "~/utils/api";

type Post = RouterOutputs["post"]["getAll"]["items"][number];
type PostResponse = RouterOutputs["post"]["getAll"];
type Stamp = Post["stamps"][number];

interface StampInput {
  postId: string;
  type: string;
  native: string;
  anonymousId: string;
}

interface StampMutationContext {
  previousPosts: PostResponse | undefined;
}

interface StampMutationError {
  message: string;
}

interface StampMutationOptions {
  onMutate?: (variables: StampInput) => Promise<StampMutationContext>;
  onError?: (
    error: StampMutationError,
    variables: StampInput,
    context: StampMutationContext,
  ) => void;
  onSettled?: () => void;
}

export function usePostStamps(
  emotionTagId?: string,
  orderBy: "asc" | "desc" = "desc",
  _: StampMutationOptions = {},
) {
  const { clientId } = useClientId();
  const utils = api.useContext();

  const { mutate: addStamp } = api.post.addStamp.useMutation({
    async onMutate(variables) {
      console.log("🚀 onMutate called with variables:", variables);

      const previousPosts = utils.post.getAll.getInfiniteData({
        limit: 10,
        emotionTagId,
        orderBy,
      });
      console.log("📦 Previous posts state:", previousPosts);

      utils.post.getAll.setInfiniteData(
        { limit: 10, emotionTagId, orderBy },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };
          console.log("🔄 Updating infinite data");
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) => {
                if (post.id !== variables.postId) return post;
                console.log("🎯 Updating post with ID:", post.id);

                // 既存のスタンプがあれば削除、なければ追加
                const existingStamp = post.stamps.find(
                  (s) =>
                    s.type === variables.type && s.anonymousId === clientId,
                );

                if (existingStamp) {
                  console.log("🗑️ Removing existing stamp:", existingStamp);
                  return {
                    ...post,
                    stamps: post.stamps.filter(
                      (s) => s.id !== existingStamp.id,
                    ),
                  };
                }

                console.log("➕ Adding new stamp");
                return {
                  ...post,
                  stamps: [
                    ...post.stamps,
                    {
                      id: `temp-${Date.now()}`,
                      type: variables.type,
                      anonymousId: clientId ?? "",
                      postId: variables.postId,
                      createdAt: new Date(),
                      native: variables.native,
                    } as Stamp,
                  ],
                };
              }),
            })),
          };
        },
      );

      return { previousPosts };
    },

    onError(error, variables, context) {
      console.error("❌ Error occurred:", error);
      console.log("🔄 Rolling back to previous state");
      if (context?.previousPosts) {
        utils.post.getAll.setInfiniteData(
          { limit: 10, emotionTagId, orderBy },
          (old) => context.previousPosts as any,
        );
      }
    },

    onSuccess(data, variables) {
      console.log("✅ Mutation succeeded:", { data, variables });
    },
  });

  const handleStampClick = useCallback(
    (postId: string, type: string, native?: string) => {
      console.log("👆 Stamp clicked:", { postId, type, native });
      if (!clientId) {
        console.warn("⚠️ No clientId available");
        return;
      }
      const input: StampInput = {
        postId,
        type,
        native: native ?? type,
        anonymousId: clientId,
      };
      addStamp(input);
    },
    [addStamp, clientId],
  );

  return {
    handleStampClick,
    clientId,
  };
}
