export const STAMP_TYPES = [
  "thanks",
  "love",
  "smile",
  "cry",
  "sad",
  "shock",
] as const;

export type StampType = (typeof STAMP_TYPES)[number];
