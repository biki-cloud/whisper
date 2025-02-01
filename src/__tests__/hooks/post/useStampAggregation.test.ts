import { renderHook } from "@testing-library/react";
import { useStampAggregation } from "~/hooks/post/useStampAggregation";
import type { ClientStamp } from "~/types/stamps";

describe("useStampAggregation", () => {
  const mockStamps: ClientStamp[] = [
    {
      id: "1",
      type: "happy",
      native: "😊",
      anonymousId: "user1",
    },
    {
      id: "2",
      type: "happy",
      native: "😊",
      anonymousId: "user2",
    },
    {
      id: "3",
      type: "sad",
      native: "😢",
      anonymousId: "user1",
    },
  ];

  beforeEach(() => {
    // コンソールエラーのモック
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("スタンプを正しく集計すること", () => {
    const { result } = renderHook(() => useStampAggregation(mockStamps));

    expect(result.current.aggregatedStamps).toHaveLength(2);
    expect(result.current.aggregatedStamps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "happy",
          count: 2,
          stamps: expect.arrayContaining([
            expect.objectContaining({ id: "1" }),
            expect.objectContaining({ id: "2" }),
          ]),
        }),
        expect.objectContaining({
          type: "sad",
          count: 1,
          stamps: expect.arrayContaining([
            expect.objectContaining({ id: "3" }),
          ]),
        }),
      ]),
    );
  });

  it("空の配列が渡された場合、空の集計結果を返すこと", () => {
    const { result } = renderHook(() => useStampAggregation([]));
    expect(result.current.aggregatedStamps).toHaveLength(0);
  });

  it("無効な入力の場合、空の配列を返しエラーをログ出力すること", () => {
    // @ts-expect-error: テスト用に意図的に無効な値を渡す
    const { result } = renderHook(() => useStampAggregation(null));

    expect(result.current.aggregatedStamps).toHaveLength(0);
    expect(console.error).toHaveBeenCalledWith(
      "Error aggregating stamps: Input must be an array",
    );
  });

  it("重複するタイプのスタンプを正しく集計すること", () => {
    const duplicateStamps: ClientStamp[] = [
      ...mockStamps,
      {
        id: "4",
        type: "happy",
        native: "😊",
        anonymousId: "user3",
      },
    ];

    const { result } = renderHook(() => useStampAggregation(duplicateStamps));

    const happyStamps = result.current.aggregatedStamps.find(
      (stamp) => stamp.type === "happy",
    );
    expect(happyStamps?.count).toBe(3);
    expect(happyStamps?.stamps).toHaveLength(3);
  });
});
