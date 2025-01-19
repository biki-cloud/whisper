import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const createPost = async (content: string, emotionTag: number) => {
  console.log("📝 新規投稿リクエスト開始:", { content, emotionTag });
  const response = await axios.post(`${API_BASE_URL}/posts/`, {
    content,
    emotion_tag_id: emotionTag,
  });
  console.log("✅ 新規投稿リクエスト完了:", response.data);
  return response.data;
};

export const fetchPosts = async () => {
  console.log("📚 投稿一覧取得リクエスト開始");
  const response = await axios.get(`${API_BASE_URL}/posts/`);
  console.log("✅ 投稿一覧取得完了:", response.data);
  return response.data;
};

export const updateEmpathyCount = async (postId: number) => {
  console.log("💝 共感リクエスト開始:", { postId });
  const response = await axios.post(`${API_BASE_URL}/posts/${postId}/empathy/`);
  console.log("✅ 共感リクエスト完了:", response.data);
  return response.data;
};
