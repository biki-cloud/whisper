import { renderHook } from "@testing-library/react";
import { useFormValidation } from "~/hooks/post/useFormValidation";

describe("useFormValidation", () => {
  it("有効な入力の場合、バリデーションが成功すること", () => {
    const { result } = renderHook(() => useFormValidation());
    const validation = result.current.validateForm(
      "テストコンテンツ",
      "test-tag-id",
    );

    expect(validation).toEqual({
      isValid: true,
      error: null,
    });
  });

  it("コンテンツが空の場合、エラーを返すこと", () => {
    const { result } = renderHook(() => useFormValidation());
    const validation = result.current.validateForm("", "test-tag-id");

    expect(validation).toEqual({
      isValid: false,
      error: "内容を入力してください",
    });
  });

  it("コンテンツが空白のみの場合、エラーを返すこと", () => {
    const { result } = renderHook(() => useFormValidation());
    const validation = result.current.validateForm("   ", "test-tag-id");

    expect(validation).toEqual({
      isValid: false,
      error: "内容を入力してください",
    });
  });

  it("コンテンツが100文字を超える場合、エラーを返すこと", () => {
    const { result } = renderHook(() => useFormValidation());
    const longContent = "a".repeat(101);
    const validation = result.current.validateForm(longContent, "test-tag-id");

    expect(validation).toEqual({
      isValid: false,
      error: "内容は100文字以内で入力してください",
    });
  });

  it("emotionTagIdが空の場合、エラーを返すこと", () => {
    const { result } = renderHook(() => useFormValidation());
    const validation = result.current.validateForm("テストコンテンツ", "");

    expect(validation).toEqual({
      isValid: false,
      error: "感情を選択してください",
    });
  });
});
