"use client";

import { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Stamp } from "~/types/stamps";

interface StampButtonProps {
  type: string;
  postId: string;
  stamps: Stamp[];
  clientId: string | undefined;
  onStampClick: (postId: string, type: string) => void;
  showCount?: boolean;
}

function getStampCount(stamps: Stamp[], type: string): number {
  return stamps.filter((stamp) => stamp.type === type).length;
}

function isStampActive(
  stamps: Stamp[],
  type: string,
  clientId: string | undefined,
): boolean {
  return stamps.some((stamp) => {
    if ("anonymousId" in stamp) {
      return stamp.type === type && stamp.anonymousId === clientId;
    }
    return false;
  });
}

function getStampNative(stamps: Stamp[], type: string): string {
  const stamp = stamps.find((s) => s.type === type);
  return stamp?.native ?? type;
}

export const StampButton = memo(function StampButton({
  type,
  postId,
  stamps,
  clientId,
  onStampClick,
  showCount = true,
}: StampButtonProps) {
  const isActive = useMemo(
    () => isStampActive(stamps, type, clientId),
    [stamps, type, clientId],
  );
  const count = useMemo(() => getStampCount(stamps, type), [stamps, type]);
  const native = useMemo(() => getStampNative(stamps, type), [stamps, type]);

  const handleClick = useCallback(() => {
    onStampClick(postId, type);
  }, [onStampClick, postId, type]);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-all duration-200 ${
        isActive
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      aria-label={`${native}スタンプを${isActive ? "削除" : "追加"}`}
      data-testid="stamp-button"
    >
      <span className="text-base leading-none" data-testid="stamp-emoji">
        {native}
      </span>
      {showCount && (
        <span className="min-w-3 font-medium" data-testid="stamp-count">
          {count}
        </span>
      )}
    </motion.button>
  );
});
