"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type EmotionTag } from "~/types/api";
import { useRouter } from "next/navigation";
import { getEmotionEmoji } from "~/utils/emotions";

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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 transition-all duration-300 ease-in-out"
      data-testid="post-form"
    >
      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-lg font-medium text-gray-700 dark:text-gray-200"
        >
          今日の想いを綴る
        </label>
        <div className="relative">
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            rows={4}
            maxLength={500}
            placeholder="あなたの気持ちや想いを自由に書いてください。誰かがあなたの気持ちに共感するかもしれません..."
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500 dark:text-gray-400">
            {content.length}/500
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="emotionTag"
          className="block text-lg font-medium text-gray-700 dark:text-gray-200"
        >
          感情
        </label>
        <div className="relative">
          <select
            id="emotionTag"
            value={selectedEmotionTagId}
            onChange={(e) => setSelectedEmotionTagId(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="" className="text-gray-500">
              選択してください
            </option>
            {emotionTags?.map((tag: EmotionTag) => {
              const emotion = getEmotionEmoji(tag.id, tag.name);
              return (
                <option
                  key={tag.id}
                  value={tag.id}
                  className={`${emotion.color} py-2`}
                >
                  {emotion.emoji} {tag.name}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="animate-shake rounded-lg bg-red-50 p-4 dark:bg-red-900/50"
          role="alert"
        >
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
              <p
                className="text-sm text-red-700 dark:text-red-200"
                data-testid="error-message"
              >
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!content || !selectedEmotionTagId || createPost.isPending}
        className="group relative w-full overflow-hidden rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        <span className="relative z-10 flex items-center justify-center">
          {createPost.isPending ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              投稿中...
            </>
          ) : (
            <>投稿する</>
          )}
        </span>
      </button>
    </form>
  );
}
