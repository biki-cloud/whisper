export const EMOTION_TAGS = [
  {
    name: "怒り",
    emoji: "😠",
    color: "bg-red-200 text-red-900 dark:text-red-200",
  },
  {
    name: "悲しみ",
    emoji: "😢",
    color: "bg-indigo-200 text-indigo-900 dark:text-indigo-200",
  },
  {
    name: "不安",
    emoji: "😰",
    color: "bg-yellow-200 text-yellow-900 dark:text-yellow-200",
  },
  {
    name: "喜び",
    emoji: "😊",
    color: "bg-green-200 text-green-900 dark:text-green-200",
  },
  {
    name: "落ち込み",
    emoji: "😔",
    color: "bg-gray-300 text-gray-900 dark:text-gray-200",
  },
  {
    name: "楽しい",
    emoji: "🎉",
    color: "bg-pink-200 text-pink-900 dark:text-pink-200",
  },
] as const;

export type EmotionTagName = (typeof EMOTION_TAGS)[number]["name"];

export interface EmotionInfo {
  emoji: string;
  label: string;
  color: string;
}

export function getEmotionInfo(tagName?: string): EmotionInfo {
  const emotionTag = EMOTION_TAGS.find((tag) => tag.name === tagName);

  if (!emotionTag) {
    return {
      emoji: "😐",
      label: "その他",
      color: "bg-gray-200 text-gray-900 dark:text-gray-200",
    };
  }

  return {
    emoji: emotionTag.emoji,
    label: emotionTag.name,
    color: emotionTag.color,
  };
}
