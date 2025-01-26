import { useState } from "react";
import { api } from "~/utils/api";

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

  const { data: emotionTags } = api.emotionTag.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    gcTime: 1000 * 60 * 30, // 30分間キャッシュを保持
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data, isLoading, refetch } = api.post.getAll.useInfiniteQuery(
    {
      limit: 10,
      emotionTagId,
      orderBy,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60, // 1分間はキャッシュを使用
      gcTime: 1000 * 60 * 5, // 5分間キャッシュを保持
      refetchOnMount: false,
      refetchOnWindowFocus: false,
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
