"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type Post } from "~/types/api";
import { getEmotionEmoji } from "~/utils/emotions";

export function PostList() {
  const utils = api.useContext();
  const [emotionTagId, setEmotionTagId] = useState<string | undefined>();
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");

  const { data, isLoading, fetchNextPage, hasNextPage } =
    api.post.getAll.useInfiniteQuery(
      {
        limit: 10,
        emotionTagId,
        orderBy,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const addEmpathy = api.post.addEmpathy.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (!posts.length) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        投稿がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-4">
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as "desc" | "asc")}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="desc">新しい順</option>
          <option value="asc">古い順</option>
        </select>
      </div>
      {posts.map((post: Post) => (
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
                getEmotionEmoji(post.emotionTag.id).color
              }`}
            >
              <span className="text-base">
                {getEmotionEmoji(post.emotionTag.id).emoji}
              </span>
              <span>{getEmotionEmoji(post.emotionTag.id).label}</span>
            </button>
            <button
              onClick={() => addEmpathy.mutate({ postId: post.id })}
              className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{post.empathies.length}</span>
            </button>
          </div>
        </div>
      ))}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => void fetchNextPage()}
            className="rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
