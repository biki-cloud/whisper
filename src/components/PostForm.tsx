"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type EmotionTag } from "~/types/api";
import { useRouter } from "next/navigation";

export function PostForm() {
  const [content, setContent] = useState("");
  const [selectedEmotionTagId, setSelectedEmotionTagId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const utils = api.useContext();
  const { data: emotionTags } = api.emotionTag.getAll.useQuery();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setSelectedEmotionTagId("");
      setError(null);
      void utils.post.getAll.invalidate();
      router.push("/");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        setError("1日1回までしか投稿できません。");
      } else {
        setError("投稿に失敗しました。もう一度お試しください。");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !selectedEmotionTagId) return;

    createPost.mutate({
      content,
      emotionTagId: selectedEmotionTagId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="post-form">
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          今日の想いを綴る
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          rows={4}
          maxLength={500}
          placeholder="今日の想いを書いてください..."
        />
      </div>

      <div>
        <label
          htmlFor="emotionTag"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          感情タグ
        </label>
        <select
          id="emotionTag"
          value={selectedEmotionTagId}
          onChange={(e) => setSelectedEmotionTagId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">選択してください</option>
          {emotionTags?.map((tag: EmotionTag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400 dark:text-red-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!content || !selectedEmotionTagId || createPost.isPending}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {createPost.isPending ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
