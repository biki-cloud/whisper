"use client";

import { useCallback } from "react";
import { api } from "~/utils/api";
import { useClientId } from "~/hooks/useClientId";
import type { RouterOutputs, RouterInputs } from "~/utils/api";
import type { InfiniteData } from "@tanstack/react-query";
import type { PostWithRelations } from "~/types/post";

type PostResponse = RouterOutputs["post"]["getAll"];
type Stamp = PostWithRelations["stamps"][number];
type StampInput = RouterInputs["post"]["addStamp"];

interface StampMutationContext {
  previousPosts: InfiniteData<PostResponse> | undefined;
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
      await utils.post.getAll.cancel();

      const previousPosts = utils.post.getAll.getInfiniteData({
        limit: 10,
        emotionTagId,
        orderBy,
      });

      utils.post.getAll.setInfiniteData(
        { limit: 10, emotionTagId, orderBy },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) => {
                if (post.id !== variables.postId) return post;

                const existingStamp = post.stamps.find(
                  (s) =>
                    s.type === variables.type && s.anonymousId === clientId,
                );

                if (existingStamp) {
                  return {
                    ...post,
                    stamps: post.stamps.filter(
                      (s) => s.id !== existingStamp.id,
                    ),
                  };
                }

                const newStamp: Stamp = {
                  id: `temp-${Date.now()}`,
                  type: variables.type,
                  anonymousId: clientId,
                  postId: variables.postId,
                  createdAt: new Date(),
                  native: variables.native,
                };

                return {
                  ...post,
                  stamps: [...post.stamps, newStamp],
                };
              }),
            })),
          };
        },
      );

      return { previousPosts };
    },

    onError(error, variables, context) {
      if (context?.previousPosts) {
        utils.post.getAll.setInfiniteData(
          { limit: 10, emotionTagId, orderBy },
          () => ({
            pages: context.previousPosts?.pages ?? [],
            pageParams: context.previousPosts?.pageParams ?? [],
          }),
        );
      }
    },

    onSuccess(data, variables) {
      // 成功時は自動的にキャッシュを更新するため、invalidateは不要
      // void utils.post.getAll.invalidate();
    },
  });

  const handleStampClick = useCallback(
    (postId: string, type: string, native?: string) => {
      if (!clientId) return;
      addStamp({
        postId,
        type,
        native: native ?? type,
      });
    },
    [addStamp, clientId],
  );

  return {
    handleStampClick,
    clientId,
  };
}
