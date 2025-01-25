import { useMemo } from "react";
import type { Stamp, AggregatedStamp } from "~/types/post";

export function useStampAggregation(stamps: Stamp[]) {
  const aggregatedStamps = useMemo(() => {
    const stampMap = stamps.reduce<Record<string, AggregatedStamp>>(
      (acc, stamp) => {
        const type = stamp.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
            stamps: [],
          };
        }
        acc[type].count += 1;
        acc[type].stamps.push(stamp);
        return acc;
      },
      {},
    );

    return Object.values(stampMap);
  }, [stamps]);

  return {
    aggregatedStamps,
  };
}
