export interface EmotionInfo {
  emoji: string;
  label: string;
  color: string;
}

export const getEmotionEmoji = (tag: number): EmotionInfo => {
  switch (tag) {
    case 1:
      return { emoji: "😊", label: "うれしい", color: "bg-yellow-100" };
    case 2:
      return { emoji: "😢", label: "かなしい", color: "bg-blue-100" };
    case 3:
      return { emoji: "😃", label: "たのしい", color: "bg-green-100" };
    case 4:
      return { emoji: "😠", label: "いかり", color: "bg-red-100" };
    case 5:
      return { emoji: "😌", label: "やすらぎ", color: "bg-purple-100" };
    case 6:
      return { emoji: "🤔", label: "もやもや", color: "bg-gray-200" };
    case 7:
      return { emoji: "😤", label: "むかつく", color: "bg-orange-100" };
    case 8:
      return { emoji: "😱", label: "びっくり", color: "bg-pink-100" };
    case 9:
      return { emoji: "🥰", label: "すき", color: "bg-red-100" };
    case 10:
      return { emoji: "😭", label: "つらい", color: "bg-indigo-100" };
    default:
      return { emoji: "😐", label: "その他", color: "bg-gray-100" };
  }
};
