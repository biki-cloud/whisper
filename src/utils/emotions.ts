export interface EmotionInfo {
  emoji: string;
  label: string;
  color: string;
}

export const getEmotionEmoji = (
  tagId: string,
  tagName?: string,
): EmotionInfo => {
  // タグ名に基づいて感情を判定
  if (tagName) {
    switch (tagName) {
      case "怒り":
        return {
          emoji: "😠",
          label: "怒り",
          color: "bg-red-200 text-red-900 dark:text-red-200",
        };
      case "悲しみ":
        return {
          emoji: "😢",
          label: "悲しみ",
          color: "bg-indigo-200 text-indigo-900 dark:text-indigo-200",
        };
      case "不安":
        return {
          emoji: "😰",
          label: "不安",
          color: "bg-yellow-200 text-yellow-900 dark:text-yellow-200",
        };
      case "喜び":
      case "嬉しい":
        return {
          emoji: "😊",
          label: tagName,
          color: "bg-green-200 text-green-900 dark:text-green-200",
        };
      case "落ち込み":
        return {
          emoji: "😔",
          label: "落ち込み",
          color: "bg-gray-300 text-gray-900 dark:text-gray-200",
        };
      case "楽しい":
        return {
          emoji: "🎉",
          label: "楽しい",
          color: "bg-pink-200 text-pink-900 dark:text-pink-200",
        };
    }
  }

  // デフォルトの返り値
  return {
    emoji: "😐",
    label: "その他",
    color: "bg-gray-200 text-gray-900 dark:text-gray-200",
  };
};
