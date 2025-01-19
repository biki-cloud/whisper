"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { type EmotionTag } from "~/types/api";

export function PostForm() {
  const [content, setContent] = useState("");
  const [selectedEmotionTagId, setSelectedEmotionTagId] = useState("");

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setSelectedEmotionTagId("");
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={!content || !selectedEmotionTagId || createPost.isLoading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {createPost.isLoading ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
