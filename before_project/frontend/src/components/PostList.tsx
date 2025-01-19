import { useEffect, useState } from "react";
import { fetchPosts, updateEmpathyCount } from "../services/api";
import { getEmotionEmoji } from "../utils/emotions";

interface Post {
  id: number;
  content: string;
  emotion_tag: {
    id: number;
    name: string;
  };
  empathy_count: number;
  created_at: string;
}

interface PostsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response: PostsResponse = await fetchPosts();
        console.log("取得した投稿データ:", response.results);
        setPosts(response.results);
      } catch (error) {
        console.error("投稿の取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleEmpathy = async (postId: number) => {
    try {
      const updatedPost = await updateEmpathyCount(postId);
      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)));
    } catch (error) {
      console.error("共感の更新に失敗しました:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            みんなの投稿
          </h1>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            みんなの投稿
          </h1>
          <p className="text-gray-600">まだ投稿がありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          みんなの投稿
        </h1>
        <div className="space-y-6">
          {posts.map((post) => {
            console.log("投稿データ:", post);
            console.log("感情データ:", post.emotion_tag);
            const emotion = getEmotionEmoji(post.emotion_tag?.id);
            return (
              <div
                key={post.id}
                className={`${emotion.color} rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
                      <span className="text-4xl">{emotion.emoji}</span>
                      <span className="text-sm text-gray-600 mt-1">
                        {emotion.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        共感数: {post.empathy_count}
                      </div>
                      <button
                        onClick={() => handleEmpathy(post.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                      >
                        共感する ♥
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PostList;
