import type { EmojiMartData, Emoji as EmojiMartEmoji } from "@emoji-mart/data";

// スタンプの型をstring型に変更（emoji-martのIDを受け入れるため）
export type StampType = string;

// emoji-martの型をそのまま使用
export type { EmojiMartEmoji as Emoji };

// emoji-martのデータ型をそのまま使用
export type { EmojiMartData as EmojiData };

export interface StampConfig {
  icon: string;
  label: string;
}
