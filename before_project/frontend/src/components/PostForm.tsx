import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/api";
import { getEmotionEmoji } from "../utils/emotions";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [emotionTag, setEmotionTag] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createPost(content, emotionTag);
      navigate("/");
    } catch (error) {
      console.error("投稿の作成に失敗しました:", error);
      setError("投稿の作成に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emotions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => ({
    id,
    ...getEmotionEmoji(id),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            今の気持ちを共有しよう
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            あなたの気持ちを自由に表現してください
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  メッセージ
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    rows={4}
                    className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="今の気持ちを書いてみましょう..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  感情を選択
                </label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.id}
                      type="button"
                      onClick={() => setEmotionTag(emotion.id)}
                      className={`${
                        emotionTag === emotion.id
                          ? "ring-2 ring-indigo-500"
                          : "hover:border-gray-400"
                      } ${
                        emotion.color
                      } relative rounded-lg p-4 flex flex-col items-center border border-gray-200 focus:outline-none`}
                    >
                      <span className="text-2xl mb-1">{emotion.emoji}</span>
                      <span className="text-sm text-gray-900">
                        {emotion.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "投稿中..." : "投稿する"}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
