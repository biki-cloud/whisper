import type { PostWithRelations } from "~/hooks/post/usePostList";

type Stamp = PostWithRelations["stamps"][number];

interface AggregatedStamp {
  type: string;
  count: number;
  stamps: Stamp[];
}

export function useStampAggregation(stamps: Stamp[]) {
  const aggregateStamps = (): AggregatedStamp[] => {
    const stampMap = stamps.reduce(
      (acc, stamp) => {
        const type = stamp.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
            stamps: [],
          };
        }
        const aggregated = acc[type];
        if (aggregated) {
          aggregated.count += 1;
          aggregated.stamps.push(stamp);
        }
        return acc;
      },
      {} as Record<string, AggregatedStamp>,
    );

    return Object.values(stampMap);
  };

  return {
    aggregatedStamps: aggregateStamps(),
  };
}
