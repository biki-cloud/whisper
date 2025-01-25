import { useState } from "react";
import { api } from "~/utils/api";
import type { EmotionTag } from "@prisma/client";

export interface PostWithRelations {
  id: string;
  content: string;
  createdAt: Date;
  anonymousId: string;
  emotionTag: {
    id: string;
    name: string;
  };
  stamps: {
    id: string;
    anonymousId: string;
    type: string;
    native: string;
  }[];
}

export function usePostList() {
  const [emotionTagId, setEmotionTagId] = useState<string | undefined>();
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();

  const { data, isLoading, refetch } = api.post.getAll.useInfiniteQuery(
    {
      limit: 10,
      emotionTagId,
      orderBy,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    void refetch().finally(() => {
      setIsRefreshing(false);
    });
  };

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    posts,
    isLoading,
    isRefreshing,
    emotionTags,
    emotionTagId,
    setEmotionTagId,
    orderBy,
    setOrderBy,
    handleRefresh,
  };
}
