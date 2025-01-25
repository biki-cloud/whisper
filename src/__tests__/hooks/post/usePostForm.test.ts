import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { renderHook, act } from "@testing-library/react";
import { usePostForm } from "~/hooks/post/usePostForm";
import { TRPCClientError } from "@trpc/client";
import React from "react";
import type { ChangeEvent } from "react";

const mockPush = jest.fn();
const mockInvalidate = jest.fn();
const mockMutate = jest.fn();
let mockOnSuccess: (() => void) | undefined;
let mockOnError: ((error: Error) => void) | undefined;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("~/utils/api", () => ({
  api: {
    useContext: () => ({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    }),
    emotionTag: {
      getAll: {
        useQuery: () => ({
          data: [{ id: "1", label: "happy" }],
        }),
      },
    },
    post: {
      create: {
        useMutation: ({ onSuccess, onError }: any) => {
          mockOnSuccess = onSuccess;
          mockOnError = onError;
          return {
            mutate: mockMutate,
            isPending: false,
          };
        },
      },
    },
  },
}));

describe("usePostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSuccess = undefined;
    mockOnError = undefined;
  });

  test("初期状態が正しいこと", () => {
    const { result } = renderHook(() => usePostForm());
    expect(result.current.content).toBe("");
    expect(result.current.emotionTagId).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isDisabled).toBe(true);
  });

  test("contentを更新できること", () => {
    const { result } = renderHook(() => usePostForm());
    act(() => {
      result.current.handleContentChange({
        target: { value: "test" },
      } as ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.content).toBe("test");
    expect(result.current.charCount).toBe(4);
  });

  test("contentが100文字を超える場合、切り捨てられること", () => {
    const { result } = renderHook(() => usePostForm());
    const longText = "a".repeat(150);
    act(() => {
      result.current.handleContentChange({
        target: { value: longText },
      } as ChangeEvent<HTMLTextAreaElement>);
    });
    expect(result.current.content.length).toBeLessThanOrEqual(100);
  });

  test("投稿が成功した場合、適切な処理が行われること", async () => {
    const { result } = renderHook(() => usePostForm());

    await act(async () => {
      result.current.setEmotionTagId("1");
      result.current.handleContentChange({
        target: { value: "test content" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    mockMutate.mockImplementationOnce(() => {
      if (mockOnSuccess) {
        mockOnSuccess();
      }
      return Promise.resolve();
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("投稿が失敗した場合、エラーメッセージが設定されること", async () => {
    const { result } = renderHook(() => usePostForm());

    await act(async () => {
      result.current.setEmotionTagId("1");
      result.current.handleContentChange({
        target: { value: "test" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    const errorMessage = "投稿に失敗しました。もう一度お試しください。";
    mockMutate.mockImplementationOnce(() => {
      if (mockOnError) {
        mockOnError(new Error(errorMessage));
      }
      throw new Error(errorMessage);
    });

    await act(async () => {
      try {
        await result.current.handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent);
      } catch (error) {
        // エラーは無視
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });
});
