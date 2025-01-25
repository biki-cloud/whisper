"use client";

import { useCallback, useState } from "react";
import { api } from "~/utils/api";
import { Card, CardContent } from "~/components/ui/card";
import {
  Filter,
  SortDesc,
  SortAsc,
  Loader2,
  RotateCw,
  Trash2,
} from "lucide-react";
import { EMOTION_TAGS } from "~/constants/emotions";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { StampPicker } from "@/components/StampPicker";

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

  const handleStampClick = useCallback(
    (postId: string, type: string, native?: string) => {
      if (!clientId) return;

      const optimisticStamp = {
        id: `temp-${Math.random()}`,
        type,
        native: native ?? type,
        anonymousId: clientId,
        postId,
        createdAt: new Date(),
      };

      void addStamp.mutate(
        { postId, type, native: native ?? type },
        {
          onMutate: async () => {
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
                        stamps: [...post.stamps, optimisticStamp],
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
          onSettled: () => {
            void utils.post.getAll.invalidate();
          },
        },
      );
    },
    [clientId, addStamp, utils.post.getAll, emotionTagId, orderBy],
  );

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

  function StampSelector({
    postId,
    stamps,
    clientId,
  }: {
    postId: string;
    stamps: {
      id: string;
      type: string;
      anonymousId: string;
      postId: string;
      createdAt: Date;
      native: string;
    }[];
    clientId: string | undefined;
  }) {
    return (
      <div className="flex flex-wrap gap-2">
        <StampPicker
          onSelect={({ type, native }) =>
            handleStampClick(postId, type, native)
          }
          disabled={!clientId}
        />
        {/* スタンプの集計と表示 */}
        {Object.entries(
          stamps.reduce(
            (acc, stamp) => {
              acc[stamp.type] = (acc[stamp.type] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
        ).map(([type, _]) => (
          <StampButton
            key={type}
            type={type}
            postId={postId}
            stamps={stamps.filter((s) => s.type === type)}
            clientId={clientId}
            onStampClick={handleStampClick}
          />
        ))}
      </div>
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
      {posts.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          投稿がありません
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-sm"
                      onClick={() => {
                        const tag = emotionTags?.find(
                          (t) => t.name === post.emotionTag.name,
                        );
                        setEmotionTagId(tag?.id);
                      }}
                    >
                      {
                        EMOTION_TAGS.find(
                          (e) => e.name === post.emotionTag.name,
                        )?.emoji
                      }{" "}
                      {post.emotionTag.name}
                    </Button>
                  </div>
                  {post.anonymousId === clientId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-2">削除</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>投稿の削除</AlertDialogTitle>
                          <AlertDialogDescription>
                            この投稿を削除してもよろしいですか？
                            本日の再投稿はできません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deletePost.mutate({ postId: post.id })
                            }
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StampSelector
                    postId={post.id}
                    stamps={post.stamps}
                    clientId={clientId}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
