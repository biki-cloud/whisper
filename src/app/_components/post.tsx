"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const utils = api.useUtils();
  const [content, setContent] = useState("");
  const [emotionTagId, setEmotionTagId] = useState("1"); // 適切なデフォルト値を設定

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setContent("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ content, emotionTagId });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        {/* 必要に応じて emotionTagId の入力フィールドを追加 */}
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
