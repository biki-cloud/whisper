"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type GetAllPostsItem } from "~/types/api";
import { getEmotionEmoji } from "~/utils/emotions";
import { type StampType, stampConfig } from "~/utils/stamps";

export function PostList() {
  const utils = api.useContext();
  const [emotionTagId, setEmotionTagId] = useState<string | undefined>();
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");

  const { data, isLoading } = api.post.getAll.useInfiniteQuery(
    {
      limit: 10,
      emotionTagId,
      orderBy,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

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

                const existingStamp = post.stamps?.find(
                  (s) => s.type === type && s.ipAddress === clientIp,
                );

                const stamps = post.stamps ?? [];

                if (existingStamp) {
                  return {
                    ...post,
                    stamps: stamps.filter((s) => s.id !== existingStamp.id),
                  };
                }

                return {
                  ...post,
                  stamps: [
                    ...stamps,
                    {
                      id: `temp-${Date.now()}`,
                      type,
                      ipAddress: clientIp ?? "",
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
    onError: (err, variables, context) => {
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
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
    },
  });

  const { data: clientIp } = api.post.getClientIp.useQuery();

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          role="status"
          className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
        ></div>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  const filterUI = (
    <div className="flex gap-4 p-4">
      <select
        value={emotionTagId ?? ""}
        onChange={(e) => setEmotionTagId(e.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-2 pr-8 dark:border-gray-600 dark:bg-gray-700"
        aria-label="すべての感情"
      >
        <option value="">すべての感情</option>
        {emotionTags?.map((tag) => {
          const emotion = getEmotionEmoji(tag.id, tag.name);
          return (
            <option key={tag.id} value={tag.id}>
              {emotion.emoji} {tag.name}
            </option>
          );
        })}
      </select>
      <select
        value={orderBy}
        onChange={(e) => setOrderBy(e.target.value as "desc" | "asc")}
        className="rounded-md border border-gray-300 px-3 py-2 pr-8 dark:border-gray-600 dark:bg-gray-700"
        aria-label="新しい順"
      >
        <option value="desc">新しい順</option>
        <option value="asc">古い順</option>
      </select>
    </div>
  );

  interface StampButtonProps {
    type: StampType;
    postId: string;
    stamps: GetAllPostsItem["stamps"];
    clientIp: string | undefined;
    onStampClick: (postId: string, type: StampType) => void;
    isPending: boolean;
  }

  function StampButton({
    type,
    postId,
    stamps,
    clientIp,
    onStampClick,
    isPending,
  }: StampButtonProps) {
    const isActive = stamps?.some(
      (stamp) => stamp.type === type && stamp.ipAddress === clientIp,
    );
    const count = stamps?.filter((stamp) => stamp.type === type).length ?? 0;

    return (
      <button
        onClick={() => onStampClick(postId, type)}
        className={`inline-flex items-center space-x-1 rounded-md px-2 py-1 ${
          isActive
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        }`}
        disabled={isPending}
        aria-label={stampConfig[type].label}
      >
        {stampConfig[type].icon}
        <span>{count}</span>
      </button>
    );
  }

  if (!posts.length) {
    return (
      <div className="space-y-4">
        {filterUI}
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          投稿がありません
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterUI}
      {posts.map((post: GetAllPostsItem) => (
        <div
          key={post.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="mb-2 text-gray-900 dark:text-gray-100">
            {post.content}
          </p>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEmotionTagId(post.emotionTag.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium dark:bg-opacity-20 ${
                getEmotionEmoji(post.emotionTag.id, post.emotionTag.name).color
              }`}
            >
              <span className="text-base">
                {
                  getEmotionEmoji(post.emotionTag.id, post.emotionTag.name)
                    .emoji
                }
              </span>
              {post.emotionTag.name}
            </button>
            {clientIp === post.ipAddress && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "この投稿を削除してもよろしいですか？ 本日の再投稿はできません。",
                    )
                  ) {
                    deletePost.mutate({
                      postId: post.id,
                    });
                  }
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                削除
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <StampButton
              type="thanks"
              postId={post.id}
              stamps={post.stamps}
              clientIp={clientIp}
              onStampClick={(postId, type) => addStamp.mutate({ postId, type })}
              isPending={addStamp.isPending}
            />
            <StampButton
              type="empathy"
              postId={post.id}
              stamps={post.stamps}
              clientIp={clientIp}
              onStampClick={(postId, type) => addStamp.mutate({ postId, type })}
              isPending={addStamp.isPending}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
