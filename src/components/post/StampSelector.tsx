import { StampPicker } from "~/components/StampPicker";
import { StampButton } from "~/components/StampButton";
import { usePostStamps } from "~/hooks/post/usePostStamps";
import type { PostWithRelations } from "~/hooks/post/usePostList";

type Stamp = PostWithRelations["stamps"][number];

interface StampSelectorProps {
  postId: string;
  stamps: Stamp[];
}

export function StampSelector({ postId, stamps }: StampSelectorProps) {
  const { clientId, handleStampClick } = usePostStamps();

  return (
    <div className="flex flex-wrap gap-2">
      <StampPicker
        onSelect={({ type, native }) => handleStampClick(postId, type, native)}
        disabled={!clientId}
      />
      {/* スタンプの集計と表示 */}
      {Object.entries(
        stamps.reduce(
          (acc, stamp) => {
            acc[stamp.type] = (acc[stamp.type] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([type, _]) => (
        <StampButton
          key={type}
          type={type}
          postId={postId}
          stamps={stamps
            .filter((s) => s.type === type)
            .map((s) => ({
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
