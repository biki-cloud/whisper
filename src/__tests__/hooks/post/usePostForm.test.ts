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
          data: [
            {
              id: "1",
              name: "happy",
              label: "幸せ",
            },
          ],
        }),
      },
    },
    post: {
      create: {
        useMutation: ({ onSuccess, onError }: any) => ({
          mutate: (...args: any[]) => {
            mockMutate(...args);
            try {
              const result = mockMutate.getMockImplementation()?.(...args);
              if (result instanceof Promise) {
                return result.then((data) => {
                  onSuccess?.();
                  return data;
                });
              }
              onSuccess?.();
              return result;
            } catch (error) {
              onError?.(error);
              throw error;
            }
          },
          isPending: false,
        }),
      },
    },
  },
}));

describe("usePostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    mockMutate.mockImplementationOnce((data) => {
      return Promise.resolve({ id: "1", ...data });
    });

    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.handleContentChange({
        target: { value: "test" },
      } as ChangeEvent<HTMLTextAreaElement>);
      result.current.setEmotionTagId("1");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      content: "test",
      emotionTagId: "1",
    });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("投稿が失敗した場合、エラーメッセージが設定されること", async () => {
    mockMutate.mockImplementationOnce(() => {
      throw new Error("投稿に失敗しました。もう一度お試しください。");
    });

    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.handleContentChange({
        target: { value: "test content" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      result.current.setEmotionTagId("1");
    });

    await act(async () => {
      await result.current
        .handleSubmit({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent)
        .catch(() => {
          // エラーは無視
        });
    });

    expect(result.current.error).toBe(
      "投稿に失敗しました。もう一度お試しください。",
    );
  });
});
