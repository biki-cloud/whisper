import { renderHook, act } from "@testing-library/react";
import { usePostForm } from "~/hooks/post/usePostForm";
import { EMOTION_TAGS } from "~/constants/emotions";

describe("usePostForm", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockPostApi = {
    create: jest.fn(),
    invalidateQueries: jest.fn(),
  };

  const mockDeps = {
    router: mockRouter,
    postApi: mockPostApi,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("初期状態が正しいこと", () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    expect(result.current.content).toBe("");
    expect(result.current.emotionTagId).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isDisabled).toBe(true);
    expect(result.current.charCount).toBe(0);
  });

  test("contentが100文字を超える場合、エラーが設定されること", () => {
    const { result } = renderHook(() => usePostForm(mockDeps));
    const longContent = "a".repeat(150);

    act(() => {
      result.current.handleContentChange({
        target: { value: longContent },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.error).toBe("内容は100文字以内で入力してください");
  });

  test("投稿が成功した場合、適切な処理が行われること", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    act(() => {
      result.current.handleContentChange({
        target: { value: "テストコンテンツ" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      result.current.setEmotionTagId(EMOTION_TAGS[0].name);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockPostApi.create).toHaveBeenCalledWith({
      content: "テストコンテンツ",
      emotionTagId: EMOTION_TAGS[0].name,
    });
    expect(mockPostApi.invalidateQueries).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/posts");
    expect(result.current.content).toBe("");
    expect(result.current.emotionTagId).toBe("");
  });

  test("投稿が失敗した場合、エラーが設定されること", async () => {
    const error = new Error("投稿に失敗しました");
    mockPostApi.create.mockRejectedValueOnce(error);
    const { result } = renderHook(() => usePostForm(mockDeps));

    act(() => {
      result.current.handleContentChange({
        target: { value: "テストコンテンツ" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      result.current.setEmotionTagId(EMOTION_TAGS[0].name);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("投稿に失敗しました");
    expect(mockRouter.push).not.toHaveBeenCalled();
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

  test("バリデーションエラー: 内容が空の場合", async () => {
    const { result } = renderHook(() => usePostForm(mockDeps));

    await act(async () => {
      result.current.setEmotionTagId(EMOTION_TAGS[0].name);
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("内容を入力してください");
    expect(mockPostApi.create).not.toHaveBeenCalled();
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
    expect(mockPostApi.create).not.toHaveBeenCalled();
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
    expect(mockPostApi.create).not.toHaveBeenCalled();
  });
});
