"use client";

import { motion } from "framer-motion";

interface StampButtonProps {
  type: string;
  postId: string;
  stamps: {
    id: string;
    type: string;
    anonymousId: string;
    postId: string;
    createdAt: Date;
    native: string;
  }[];
  clientId: string | undefined;
  onStampClick: (postId: string, type: string) => void;
  showCount?: boolean;
}

export function StampButton({
  type,
  postId,
  stamps,
  clientId,
  onStampClick,
  showCount = true,
}: StampButtonProps) {
  const isActive = stamps?.some(
    (stamp) => stamp.type === type && stamp.anonymousId === clientId,
  );
  const count = stamps?.filter((stamp) => stamp.type === type).length ?? 0;
  // スタンプの絵文字を取得
  const native = stamps.find((stamp) => stamp.type === type)?.native ?? type;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onStampClick(postId, type)}
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-all duration-200 ${
        isActive
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      aria-label={`${type}ボタン`}
    >
      <span className="text-base leading-none">{native}</span>
      {showCount && <span className="min-w-3 font-medium">{count}</span>}
    </motion.button>
  );
}
