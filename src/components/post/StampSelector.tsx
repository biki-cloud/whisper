"use client";

import { StampPicker } from "~/components/StampPicker";
import { StampButton } from "~/components/StampButton";
import { usePostStamps } from "~/hooks/post/usePostStamps";
import { useStampAggregation } from "~/hooks/post/useStampAggregation";
import type { PostWithRelations } from "~/hooks/post/usePostList";

type Stamp = PostWithRelations["stamps"][number];

interface StampSelectorProps {
  postId: string;
  stamps: Stamp[];
}

export function StampSelector({ postId, stamps }: StampSelectorProps) {
  const { clientId, handleStampClick } = usePostStamps();
  const { aggregatedStamps } = useStampAggregation(stamps);

  return (
    <div className="flex flex-wrap gap-2" data-testid="stamp-selector">
      <StampPicker
        onSelect={({ type, native }) => handleStampClick(postId, type, native)}
        disabled={!clientId}
      />
      {aggregatedStamps.map(({ type, stamps: stampsByType }) => (
        <StampButton
          key={type}
          type={type}
          postId={postId}
          stamps={stampsByType.map((s) => ({
            ...s,
            postId,
            createdAt: new Date(),
          }))}
          clientId={clientId}
          onStampClick={handleStampClick}
        />
      ))}
    </div>
  );
}
