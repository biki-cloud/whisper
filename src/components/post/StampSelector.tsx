"use client";

import { memo, useCallback } from "react";
import { StampPicker } from "~/components/StampPicker";
import { StampButton } from "~/components/StampButton";
import { usePostStamps } from "~/hooks/post/usePostStamps";
import { useStampAggregation } from "~/hooks/post/useStampAggregation";
import type { Stamp } from "~/types/stamps";

interface StampSelectorProps {
  postId: string;
  stamps: Stamp[];
}

export const StampSelector = memo(function StampSelector({
  postId,
  stamps,
}: StampSelectorProps) {
  const { clientId, handleStampClick } = usePostStamps();
  const { aggregatedStamps } = useStampAggregation(stamps);

  const handleSelect = useCallback(
    ({ type, native }: { type: string; native: string }) => {
      handleStampClick(postId, type, native);
    },
    [handleStampClick, postId],
  );

  return (
    <div className="flex flex-wrap gap-2" data-testid="stamp-selector">
      <StampPicker onSelect={handleSelect} disabled={!clientId} />
      {aggregatedStamps.map(({ type, stamps: stampsByType }) => (
        <StampButton
          key={type}
          type={type}
          postId={postId}
          stamps={stampsByType}
          clientId={clientId}
          onStampClick={handleStampClick}
        />
      ))}
    </div>
  );
});
