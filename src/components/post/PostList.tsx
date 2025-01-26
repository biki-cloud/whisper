"use client";

import { Loader2 } from "lucide-react";
import { PostFilter } from "./PostFilter";
import { PostCard } from "./PostCard";
import { usePostList } from "~/hooks/post/usePostList";
import { usePostStamps } from "~/hooks/post/usePostStamps";
import { logger } from "~/lib/logger/client";

const postLogger = logger.child({ component: "PostList" });

export function PostList() {
  const {
    posts,
    isLoading,
    isRefreshing,
    emotionTags,
    emotionTagId,
    setEmotionTagId,
    orderBy,
    setOrderBy,
    handleRefresh,
  } = usePostList();

  const { clientId } = usePostStamps(emotionTagId, orderBy);

  if (isLoading) {
    postLogger.info("投稿一覧を読み込み中");
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  postLogger.info(
    { postsCount: posts.length, emotionTagId, orderBy },
    "投稿一覧を表示",
  );

  return (
    <div className="space-y-6">
      <PostFilter
        emotionTags={emotionTags}
        emotionTagId={emotionTagId}
        setEmotionTagId={(id) => {
          postLogger.info({ emotionTagId: id }, "感情タグでフィルター");
          setEmotionTagId(id);
        }}
        orderBy={orderBy}
        setOrderBy={(order) => {
          postLogger.info({ orderBy: order }, "表示順を変更");
          setOrderBy(order);
        }}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          postLogger.info("投稿一覧を更新");
          handleRefresh();
        }}
      />
      {posts.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          投稿がありません
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              clientId={clientId}
              onEmotionTagClick={setEmotionTagId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
