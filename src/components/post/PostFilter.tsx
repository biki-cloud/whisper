import { Filter, SortDesc, SortAsc, RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { EMOTION_TAGS } from "~/constants/emotions";
import type { EmotionTag } from "@prisma/client";

interface PostFilterProps {
  emotionTags: EmotionTag[] | undefined;
  emotionTagId: string | undefined;
  setEmotionTagId: (id: string | undefined) => void;
  orderBy: "desc" | "asc";
  setOrderBy: (orderBy: "desc" | "asc") => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function PostFilter({
  emotionTags,
  emotionTagId,
  setEmotionTagId,
  orderBy,
  setOrderBy,
  isRefreshing,
  onRefresh,
}: PostFilterProps) {
  return (
    <div className="sticky top-0 z-10 mb-6 space-y-4 rounded-lg bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRefresh()}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <select
          value={emotionTagId ?? ""}
          onChange={(e) => setEmotionTagId(e.target.value || undefined)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="すべての感情"
        >
          <option value="">すべての感情</option>
          {EMOTION_TAGS.map((emotion) => {
            const tag = emotionTags?.find((t) => t.name === emotion.name);
            return (
              <option key={tag?.id ?? emotion.name} value={tag?.id ?? ""}>
                {emotion.emoji} {emotion.name}
              </option>
            );
          })}
        </select>
        <div className="relative flex-1">
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value as "desc" | "asc")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="新しい順"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {orderBy === "desc" ? (
              <SortDesc className="h-4 w-4 text-muted-foreground" />
            ) : (
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
