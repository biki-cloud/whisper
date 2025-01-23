"use client";

import { type ReactNode } from "react";

export interface StampConfig {
  icon: ReactNode;
  label: string;
}

export type StampType = "thanks" | "empathy";

export const stampConfig: Record<StampType, StampConfig> = {
  thanks: {
    icon: <span className="text-xl">😢</span>,
    label: "ありがとうボタン",
  },
  empathy: {
    icon: <span className="text-xl">🙏</span>,
    label: "共感ボタン",
  },
} as const;
