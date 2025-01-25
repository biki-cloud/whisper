import { renderHook, act } from "@testing-library/react";
import { useFormState } from "~/hooks/post/useFormState";

describe("useFormState", () => {
  it("初期状態が正しいこと", () => {
    const { result } = renderHook(() => useFormState());

    expect(result.current.state).toEqual({
      content: "",
      emotionTagId: "",
      error: null,
    });
    expect(result.current.charCount).toBe(0);
  });

  it("setContentが正しく動作すること", () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setContent("テストコンテンツ");
    });

    expect(result.current.state.content).toBe("テストコンテンツ");
    expect(result.current.charCount).toBe(8);
    expect(result.current.state.error).toBeNull();
  });

  it("100文字を超えるコンテンツを設定した場合、エラーが設定されること", () => {
    const { result } = renderHook(() => useFormState());
    const longContent = "a".repeat(101);

    act(() => {
      result.current.setContent(longContent);
    });

    expect(result.current.state.content).toBe(longContent);
    expect(result.current.state.error).toBe(
      "内容は100文字以内で入力してください",
    );
  });

  it("setEmotionTagIdが正しく動作すること", () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setEmotionTagId("test-tag-id");
    });

    expect(result.current.state.emotionTagId).toBe("test-tag-id");
  });

  it("setErrorが正しく動作すること", () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setError("テストエラー");
    });

    expect(result.current.state.error).toBe("テストエラー");
  });

  it("resetFormが正しく動作すること", () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setContent("テストコンテンツ");
      result.current.setEmotionTagId("test-tag-id");
      result.current.setError("テストエラー");
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.state).toEqual({
      content: "",
      emotionTagId: "",
      error: null,
    });
    expect(result.current.charCount).toBe(0);
  });
});
