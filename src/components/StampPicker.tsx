"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type StampType } from "@/types/stamps";
import { Smile } from "lucide-react";

interface StampPickerProps {
  onSelect: (stamp: { type: StampType; native: string }) => void;
  disabled?: boolean;
}

// emoji-martの型定義
interface EmojiMartEmoji {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

// スタンプアイコンの型定義
interface StampIconProps {
  props: {
    className: string;
    children: string;
  };
}

export function StampPicker({ onSelect, disabled }: StampPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="relative"
        >
          <Smile className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            +
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Picker
          data={data}
          onEmojiSelect={(emoji: EmojiMartEmoji) => {
            // 選択された絵文字をそのままスタンプとして使用
            onSelect({
              type: emoji.native,
              native: emoji.native,
            });
          }}
          theme="light"
          locale="ja"
          previewPosition="none"
          skinTonePosition="none"
        />
      </PopoverContent>
    </Popover>
  );
}
