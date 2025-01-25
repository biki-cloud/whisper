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
      await utils.post.getAll.cancel();
      const previousPosts = utils.post.getAll.getData({
        emotionTagId,
        orderBy,
      });

      if (previousPosts) {
        utils.post.getAll.setData(
          { emotionTagId, orderBy },
          {
            ...previousPosts,
            items: previousPosts.items.map((post) => {
              if (post.id === variables.postId) {
                return {
                  ...post,
                  stamps: [
                    ...post.stamps,
                    {
                      id: "temp",
                      type: variables.type,
                      anonymousId: clientId ?? "",
                      postId: variables.postId,
                      createdAt: new Date(),
                      native: variables.native,
                    } as Stamp,
                  ],
                };
              }
              return post;
            }),
          },
        );
      }

      return { previousPosts };
    },

    onError(error, variables, context) {
      if (context?.previousPosts) {
        utils.post.getAll.setData(
          { emotionTagId, orderBy },
          context.previousPosts,
        );
      }
    },

    onSettled() {
      void utils.post.getAll.invalidate({ emotionTagId, orderBy });
    },
  });

  const handleStampClick = useCallback(
    (postId: string, type: string, native?: string) => {
      if (!clientId) return;
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
