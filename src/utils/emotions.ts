import { type EmotionInfo, getEmotionInfo } from "~/constants/emotions";

export { type EmotionInfo, getEmotionInfo };

export const getEmotionEmoji = (
  tagId: string,
  tagName?: string,
): EmotionInfo => {
  return getEmotionInfo(tagName);
};
