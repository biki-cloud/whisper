import { renderHook, act } from "@testing-library/react";
import { usePostForm } from "~/hooks/post/usePostForm";
import type { EmotionTag } from "@prisma/client";

describe("usePostForm", () => {
  const mockDeps = {
    router: {
      push: jest.fn(),
    },
    postApi: {
      create: jest.fn(),
      invalidateQueries: jest.fn(),
    },
    emotionTagApi: {
      getAll: jest.fn(),
    },
  };

  const mockEmotionTags: Pick<EmotionTag, "id" | "name">[] = [
    { id: "1", name: "happy" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeps.emotionTagApi.getAll.mockResolvedValue(mockEmotionTags);
  });

  test("初期状態が正しいこと", () => {
    const { result } = renderHook(() => usePostForm(mockDeps));
    expect(result.current.content).toBe("");
    expect(result.current.emotionTagId).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isDisabled).toBe(true);
  });

  test("contentを更新できること", () => {
    const { result } = renderHook(() => usePostForm(mockDeps));
    act(() => {
      result.current.handleContentChange({
        target: { value: "test" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.content).toBe("test");
    expect(result.current.charCount).toBe(4);
  });

  test("contentが100文字を超える場合、切り捨てられること", () => {
    const { result } = renderHook(() => usePostForm(mockDeps));
    const longText = "a".repeat(150);
    act(() => {
      result.current.handleContentChange({
        target: { value: longText },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.content.length).toBeLessThanOrEqual(100);
  });

  test("投稿が成功した場合、適切な処理が行われること", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      result.current.setEmotionTagId("1");
      result.current.handleContentChange({
        target: { value: "test content" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockDeps.postApi.create).toHaveBeenCalledWith({
      content: "test content",
      emotionTagId: "1",
    });
    expect(mockDeps.postApi.invalidateQueries).toHaveBeenCalled();
    expect(mockDeps.router.push).toHaveBeenCalledWith("/");
  });

  test("投稿が失敗した場合、エラーが設定されること", async () => {
    const error = new Error("投稿に失敗しました");
    mockDeps.postApi.create.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      result.current.setEmotionTagId("1");
      result.current.handleContentChange({
        target: { value: "test content" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(error.message);
  });

  test("感情タグの読み込みが成功すること", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      await result.current.loadEmotionTags();
    });

    expect(result.current.emotionTags).toEqual(mockEmotionTags);
  });

  test("感情タグの読み込みが失敗した場合、エラーが設定されること", async () => {
    mockDeps.emotionTagApi.getAll.mockRejectedValueOnce(new Error());

    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      await result.current.loadEmotionTags();
    });

    expect(result.current.error).toBe("感情タグの読み込みに失敗しました");
  });

  test("バリデーションエラー: 内容が空の場合", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      result.current.setEmotionTagId("1");
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("内容を入力してください");
    expect(mockDeps.postApi.create).not.toHaveBeenCalled();
  });

  test("バリデーションエラー: 感情タグが選択されていない場合", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      result.current.handleContentChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("内容を入力してください");
    expect(mockDeps.postApi.create).not.toHaveBeenCalled();
  });

  test("バリデーションエラー: 内容が100文字を超える場合", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));
    const longContent = "a".repeat(101);

    await act(async () => {
      result.current.handleContentChange({
        target: { value: longContent },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.error).toBe("内容は100文字以内で入力してください");
    expect(mockDeps.postApi.create).not.toHaveBeenCalled();
  });
});
