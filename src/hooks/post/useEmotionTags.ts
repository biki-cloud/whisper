import { useState } from "react";
import type { EmotionTag } from "@prisma/client";

interface EmotionTagsApi {
  getAll: () => Promise<EmotionTag[]>;
}

export function useEmotionTags(emotionTagApi: EmotionTagsApi) {
  const [emotionTags, setEmotionTags] = useState<EmotionTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadEmotionTags = async () => {
    try {
      const tags = await emotionTagApi.getAll();
      setEmotionTags(tags);
      setError(null);
    } catch (err) {
      setError(`感情タグの読み込みに失敗しました: ${String(err)}`);
    }
  };

  return {
    emotionTags,
    error,
    loadEmotionTags,
  };
}
