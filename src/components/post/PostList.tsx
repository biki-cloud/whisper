"use client";

import { Loader2 } from "lucide-react";
import { PostFilter } from "./PostFilter";
import { PostCard } from "./PostCard";
import { usePostList } from "~/hooks/post/usePostList";
import { usePostStamps } from "~/hooks/post/usePostStamps";

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
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PostFilter
        emotionTags={emotionTags}
        emotionTagId={emotionTagId}
        setEmotionTagId={setEmotionTagId}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
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
