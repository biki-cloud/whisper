import type { EmojiMartData, Emoji as EmojiMartEmoji } from "@emoji-mart/data";

// スタンプの型をstring型に変更（emoji-martのIDを受け入れるため）
export type StampType = string;

// emoji-martの型をそのまま使用
export type { EmojiMartEmoji as Emoji };

// emoji-martのデータ型をそのまま使用
export type { EmojiMartData as EmojiData };

export interface BaseStamp {
  id: string;
  type: StampType;
  native?: string;
}

export interface PostStamp extends BaseStamp {
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientStamp extends BaseStamp {
  anonymousId: string;
}

export type Stamp = PostStamp | ClientStamp;

export interface StampConfig {
  icon: string;
  label: string;
}

export interface AggregatedStamp {
  type: StampType;
  count: number;
  stamps: Stamp[];
}
