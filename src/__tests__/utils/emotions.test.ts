import { getEmotionEmoji, type EmotionInfo } from "@/utils/emotions";

describe("getEmotionEmoji", () => {
  it("タグ名が「怒り」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("1", "怒り");
    expect(result).toEqual({
      emoji: "😠",
      label: "怒り",
      color: "bg-red-200 text-red-900 dark:text-red-200",
    });
  });

  it("タグ名が「悲しみ」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("2", "悲しみ");
    expect(result).toEqual({
      emoji: "😢",
      label: "悲しみ",
      color: "bg-indigo-200 text-indigo-900 dark:text-indigo-200",
    });
  });

  it("タグ名が「不安」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("3", "不安");
    expect(result).toEqual({
      emoji: "😰",
      label: "不安",
      color: "bg-yellow-200 text-yellow-900 dark:text-yellow-200",
    });
  });

  it("タグ名が「喜び」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("4", "喜び");
    expect(result).toEqual({
      emoji: "😊",
      label: "喜び",
      color: "bg-green-200 text-green-900 dark:text-green-200",
    });
  });

  it("タグ名が「落ち込み」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("6", "落ち込み");
    expect(result).toEqual({
      emoji: "😔",
      label: "落ち込み",
      color: "bg-gray-300 text-gray-900 dark:text-gray-200",
    });
  });

  it("タグ名が「楽しい」の場合、正しい感情情報を返す", () => {
    const result = getEmotionEmoji("7", "楽しい");
    expect(result).toEqual({
      emoji: "🎉",
      label: "楽しい",
      color: "bg-pink-200 text-pink-900 dark:text-pink-200",
    });
  });

  it("タグ名が未定義の場合、デフォルトの感情情報を返す", () => {
    const result = getEmotionEmoji("8");
    expect(result).toEqual({
      emoji: "😐",
      label: "その他",
      color: "bg-gray-200 text-gray-900 dark:text-gray-200",
    });
  });

  it("タグ名が未知の値の場合、デフォルトの感情情報を返す", () => {
    const result = getEmotionEmoji("9", "未知の感情");
    expect(result).toEqual({
      emoji: "😐",
      label: "その他",
      color: "bg-gray-200 text-gray-900 dark:text-gray-200",
    });
  });
});
