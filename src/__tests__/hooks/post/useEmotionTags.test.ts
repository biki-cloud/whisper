import { renderHook, act } from "@testing-library/react";
import { useEmotionTags } from "~/hooks/post/useEmotionTags";

describe("useEmotionTags", () => {
  const mockEmotionTags = [
    { id: "1", name: "happy", native: "😊" },
    { id: "2", name: "sad", native: "😢" },
  ];

  const mockEmotionTagApi = {
    getAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期状態が正しいこと", () => {
    const { result } = renderHook(() => useEmotionTags(mockEmotionTagApi));

    expect(result.current.emotionTags).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("loadEmotionTagsが成功した場合、感情タグが設定されること", async () => {
    mockEmotionTagApi.getAll.mockResolvedValueOnce(mockEmotionTags);
    const { result } = renderHook(() => useEmotionTags(mockEmotionTagApi));

    await act(async () => {
      await result.current.loadEmotionTags();
    });

    expect(result.current.emotionTags).toEqual(mockEmotionTags);
    expect(result.current.error).toBeNull();
    expect(mockEmotionTagApi.getAll).toHaveBeenCalledTimes(1);
  });

  it("loadEmotionTagsが失敗した場合、エラーが設定されること", async () => {
    mockEmotionTagApi.getAll.mockRejectedValueOnce(new Error("API Error"));
    const { result } = renderHook(() => useEmotionTags(mockEmotionTagApi));

    await act(async () => {
      await result.current.loadEmotionTags();
    });

    expect(result.current.emotionTags).toEqual([]);
    expect(result.current.error).toBe(
      "感情タグの読み込みに失敗しました: Error: API Error",
    );
    expect(mockEmotionTagApi.getAll).toHaveBeenCalledTimes(1);
  });

  it("loadEmotionTags成功後にエラーがクリアされること", async () => {
    mockEmotionTagApi.getAll
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(mockEmotionTags);

    const { result } = renderHook(() => useEmotionTags(mockEmotionTagApi));

    // 最初の呼び出しで失敗
    await act(async () => {
      await result.current.loadEmotionTags();
    });
    expect(result.current.error).toBe(
      "感情タグの読み込みに失敗しました: Error: API Error",
    );

    // 2回目の呼び出しで成功
    await act(async () => {
      await result.current.loadEmotionTags();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.emotionTags).toEqual(mockEmotionTags);
  });
});
