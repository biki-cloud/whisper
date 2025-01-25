"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type GetAllPostsItem } from "~/types/api";
import { type StampType } from "~/types/stamps";
import { stampConfig } from "~/utils/stamps";
import { Card, CardContent } from "~/components/ui/card";
import { Filter, SortDesc, SortAsc, Loader2, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { EMOTION_TAGS } from "~/constants/emotions";
import { Button } from "~/components/ui/button";

export function PostList() {
  const utils = api.useContext();
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const addStamp = api.post.addStamp.useMutation({
    onMutate: async ({ postId, type }) => {
      await utils.post.getAll.cancel();
      const prevData = utils.post.getAll.getInfiniteData();

      utils.post.getAll.setInfiniteData(
        { limit: 10, emotionTagId: emotionTagId, orderBy },
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
          { limit: 10, emotionTagId: emotionTagId, orderBy },
          context.prevData,
        );
      }
    },
    onSettled: async (data, error, _) => {
      if (error) {
        await utils.post.getAll.invalidate();
      }
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
    },
  });

  const { data: clientId } = api.post.getClientId.useQuery();

  const [pendingStamps, setPendingStamps] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  const filterUI = (
    <div className="sticky top-0 z-10 mb-6 space-y-4 rounded-lg bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <select
          value={emotionTagId ?? ""}
          onChange={(e) => setEmotionTagId(e.target.value || undefined)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="すべての感情"
        >
          <option value="">すべての感情</option>
          {EMOTION_TAGS.map((emotion) => {
            const tag = emotionTags?.find((t) => t.name === emotion.name);
            return (
              <option key={tag?.id ?? emotion.name} value={tag?.id ?? ""}>
                {emotion.emoji} {emotion.name}
              </option>
            );
          })}
        </select>
        <div className="relative flex-1">
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value as "desc" | "asc")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="新しい順"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {orderBy === "desc" ? (
              <SortDesc className="h-4 w-4 text-muted-foreground" />
            ) : (
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  interface StampButtonProps {
    type: StampType;
    postId: string;
    stamps: GetAllPostsItem["stamps"];
    clientId: string | undefined;
    onStampClick: (postId: string, type: StampType) => void;
  }

  function StampButton({
    type,
    postId,
    stamps,
    clientId,
    onStampClick,
  }: Omit<StampButtonProps, "isPending">) {
    const isActive = stamps?.some(
      (stamp) => stamp.type === type && stamp.anonymousId === clientId,
    );
    const count = stamps?.filter((stamp) => stamp.type === type).length ?? 0;
    const stampKey = `${postId}-${type}`;
    const isPending = pendingStamps.has(stampKey);

    const handleClick = () => {
      setPendingStamps((prev) => new Set([...prev, stampKey]));
      onStampClick(postId, type);
      // 300ms後にpendingを解除（最小限のスロットリング）
      setTimeout(() => {
        setPendingStamps((prev) => {
          const next = new Set(prev);
          next.delete(stampKey);
          return next;
        });
      }, 300);
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            : "bg-muted hover:bg-muted/80"
        }`}
        disabled={isPending}
        aria-label={stampConfig[type].label}
      >
        <span className="text-base">{stampConfig[type].icon}</span>
        <span className="min-w-4 font-medium">{count}</span>
      </motion.button>
    );
  }

  if (!posts.length) {
    return (
      <div className="space-y-4">
        {filterUI}
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          投稿がありません
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filterUI}
      <div className="grid gap-4">
        {posts.map((post: GetAllPostsItem, _) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group overflow-hidden border-none bg-gradient-to-br from-card to-muted/50 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <p className="mb-4 text-lg leading-relaxed">{post.content}</p>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setEmotionTagId(post.emotionTag.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      EMOTION_TAGS.find((e) => e.name === post.emotionTag.name)
                        ?.color ??
                      "bg-gray-200 text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    <span className="text-base">
                      {EMOTION_TAGS.find((e) => e.name === post.emotionTag.name)
                        ?.emoji ?? "😐"}
                    </span>
                    {post.emotionTag.name}
                  </button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <time dateTime={new Date(post.createdAt).toISOString()}>
                      {new Date(post.createdAt).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {clientId === post.anonymousId && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "この投稿を削除してもよろしいですか？ 本日の再投稿はできません。",
                            )
                          ) {
                            deletePost.mutate({ postId: post.id });
                          }
                        }}
                        className="text-destructive/80 hover:text-destructive"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stampConfig).map(([type]) => (
                    <StampButton
                      key={type}
                      type={type as StampType}
                      postId={post.id}
                      stamps={post.stamps}
                      clientId={clientId}
                      onStampClick={(postId, type) =>
                        addStamp.mutate({ postId, type })
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
