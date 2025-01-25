import { useCallback } from "react";
import { api } from "~/utils/api";

export function usePostStamps(
  emotionTagId?: string,
  orderBy: "desc" | "asc" = "desc",
) {
  const utils = api.useContext();
  const { data: clientId } = api.post.getClientId.useQuery();

  const addStamp = api.post.addStamp.useMutation({
    onMutate: async ({ postId, type }) => {
      await utils.post.getAll.cancel();
      const prevData = utils.post.getAll.getInfiniteData({
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
                if (post.id !== postId) return post;
                const existingStamp = post.stamps.find(
                  (s) => s.type === type && s.anonymousId === clientId,
                );
                if (existingStamp) {
                  return {
                    ...post,
                    stamps: post.stamps.filter(
                      (s) => s.id !== existingStamp.id,
                    ),
                  };
                }
                return {
                  ...post,
                  stamps: [
                    ...post.stamps,
                    {
                      id: `temp-${Date.now()}`,
                      type,
                      anonymousId: clientId ?? "",
                      postId,
                      createdAt: new Date(),
                      native: type,
                    },
                  ],
                };
              }),
            })),
          };
        },
      );
      return { prevData };
    },
    onError: (_, __, context) => {
      if (context?.prevData) {
        utils.post.getAll.setInfiniteData(
          { limit: 10, emotionTagId, orderBy },
          context.prevData,
        );
      }
    },
  });

  const handleStampClick = useCallback(
    (postId: string, type: string, native?: string) => {
      if (!clientId) return;

      void addStamp.mutate({ postId, type, native: native ?? type });
    },
    [clientId, addStamp],
  );

  return {
    clientId,
    handleStampClick,
  };
}
