"use client";

import { api } from "~/utils/api";
import { type Post } from "~/types/api";

export function PostList() {
  const utils = api.useContext();
  const { data: posts, isLoading } = api.post.getLatest.useQuery();
  const addEmpathy = api.post.addEmpathy.useMutation({
    onSuccess: () => {
      void utils.post.getLatest.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        投稿がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: Post) => (
        <div
          key={post.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="mb-2 text-gray-900 dark:text-gray-100">
            {post.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {post.emotionTag.name}
            </span>
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
    </div>
  );
}
