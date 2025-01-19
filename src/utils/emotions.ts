export interface EmotionInfo {
  emoji: string;
  label: string;
  color: string;
}

export const getEmotionEmoji = (tagId: string): EmotionInfo => {
  switch (tagId) {
    case "clh1234567890": // 怒り
      return {
        emoji: "😠",
        label: "怒り",
        color: "bg-red-200 text-red-900 dark:text-red-200",
      };
    case "clh1234567891": // 悲しみ
      return {
        emoji: "😢",
        label: "悲しみ",
        color: "bg-indigo-200 text-indigo-900 dark:text-indigo-200",
      };
    case "clh1234567892": // 不安
      return {
        emoji: "😰",
        label: "不安",
        color: "bg-yellow-200 text-yellow-900 dark:text-yellow-200",
      };
    case "clh1234567893": // 喜び
      return {
        emoji: "😊",
        label: "喜び",
        color: "bg-green-200 text-green-900 dark:text-green-200",
      };
    case "clh1234567894": // 落ち込み
      return {
        emoji: "😔",
        label: "落ち込み",
        color: "bg-gray-300 text-gray-900 dark:text-gray-200",
      };
    default:
      return {
        emoji: "😐",
        label: "その他",
        color: "bg-gray-200 text-gray-900 dark:text-gray-200",
      };
  }
};
