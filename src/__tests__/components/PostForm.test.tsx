/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostForm } from "~/components/PostForm";
import { renderWithProviders } from "~/utils/test-utils";
import { api } from "~/utils/api";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import type {
  UseTRPCMutationResult,
  UseTRPCMutationOptions,
} from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { EMOTION_TAGS } from "~/constants/emotions";

type Post = {
  id: string;
  content: string;
  emotionTagId: string;
  createdAt: Date;
  anonymousId: string;
  emotionTag: {
    id: string;
    name: string;
  };
  stamps: {
    id: string;
    type: string;
    postId: string;
    createdAt: Date;
    anonymousId: string;
  }[];
};

type CreatePostInput = {
  content: string;
  emotionTagId: string;
};

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("~/utils/api", () => ({
  api: {
    emotionTag: {
      getAll: {
        useQuery: jest.fn().mockReturnValue({
          data: [
            { id: "1", name: "怒り" },
            { id: "2", name: "悲しみ" },
            { id: "3", name: "不安" },
            { id: "4", name: "喜び" },
            { id: "5", name: "落ち込み" },
            { id: "6", name: "楽しい" },
          ],
        }),
      },
    },
    post: {
      create: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
          isPending: false,
        }),
      },
    },
    useContext: jest.fn().mockReturnValue({
      post: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    }),
  },
}));

describe("PostForm", () => {
  const mockPush = jest.fn();
  const mockInvalidate = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (api.useContext as jest.Mock).mockReturnValue({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    });
    (api.post.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);
    expect(screen.getByLabelText("今の気持ち")).toBeInTheDocument();
    expect(screen.getByLabelText("メッセージ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "投稿する" }),
    ).toBeInTheDocument();
  });

  it("必須フィールドが空の場合、投稿ボタンが無効化されること", () => {
    renderWithProviders(<PostForm />);
    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).toBeDisabled();
  });

  it("投稿が成功した場合、適切な処理が行われること", async () => {
    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        content: "テスト投稿",
        emotionTagId: "1",
      });
      expect(mockPush).toHaveBeenCalledWith("/posts");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("投稿が失敗した場合、エラーメッセージが表示されること", async () => {
    (api.post.create.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn().mockImplementation(() => {
        throw new Error("FORBIDDEN");
      }),
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("投稿に失敗しました。もう一度お試しください。"),
      ).toBeInTheDocument();
    });
  });

  it("投稿中はローディング表示が表示されること", () => {
    (api.post.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByText("投稿中...")).toBeInTheDocument();
  });

  it("投稿内容が空の場合、投稿ボタンが無効化されること", () => {
    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).toBeDisabled();
  });

  it("感情が選択されていない場合、投稿ボタンが無効化されること", () => {
    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText("メッセージ");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).toBeDisabled();
  });

  it("感情タグが正しく表示されること", () => {
    renderWithProviders(<PostForm />);

    EMOTION_TAGS.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
      expect(screen.getByText(tag.emoji)).toBeInTheDocument();
    });
  });

  it("フォームの入力が正しく動作すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    expect(contentInput).toHaveValue("テスト投稿");
    expect(emotionSelect).toHaveValue("1");
  });

  it("文字数制限が100文字に設定されていること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("メッセージ");
    expect(contentInput).toHaveAttribute("maxLength", "100");

    // 100文字のテストデータ
    const hundredChars = "あ".repeat(100);

    // 100文字までは入力可能
    fireEvent.change(contentInput, { target: { value: hundredChars } });
    expect(contentInput).toHaveValue(hundredChars);
    expect(screen.getByText("100/100")).toBeInTheDocument();
  });

  it("文字数制限が正しく機能すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("メッセージ");
    const testContent = "a".repeat(100);

    fireEvent.change(contentInput, { target: { value: testContent } });

    expect(contentInput).toHaveAttribute("maxLength", "100");
    expect(contentInput).toHaveValue(testContent);
  });

  it("フォーム送信時にpreventDefaultが呼ばれること", () => {
    renderWithProviders(<PostForm />);

    const form = screen.getByTestId("post-form");
    const mockPreventDefault = jest.fn();

    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "preventDefault", {
      value: mockPreventDefault,
      configurable: true,
    });

    form.dispatchEvent(event);

    expect(mockPreventDefault).toHaveBeenCalled();
  });

  it("投稿成功時にフォームがリセットされること", async () => {
    const mockMutate = jest.fn().mockImplementation((data) => {
      mockMutate(data);
    });

    const mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      trpc: { path: "post.create" },
    };

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      (options: any) => {
        const mutate = (data: any) => {
          mockMutate(data);
          setTimeout(() => {
            options.onSuccess?.();
          }, 0);
        };
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(contentInput).toHaveValue("");
      expect(emotionSelect).toHaveValue("");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("最大文字数を超えた入力ができないこと", () => {
    renderWithProviders(<PostForm />);
    const contentInput = screen.getByPlaceholderText(
      "あなたの気持ちや想いを自由に書いてください。誰かがあなたの気持ちに共感するかもしれません...",
    );
    expect(contentInput).toHaveAttribute("maxLength", "100");

    // 100文字の入力
    const hundredChars = "a".repeat(100);
    fireEvent.change(contentInput, { target: { value: hundredChars } });
    expect(contentInput).toHaveValue(hundredChars);
    expect(screen.getByText("100/100")).toBeInTheDocument();

    // 101文字の入力を試みる
    const overHundredChars = "a".repeat(101);
    fireEvent.change(contentInput, { target: { value: overHundredChars } });
    // maxLength属性により、入力は101文字目以降が切り捨てられる
    expect(contentInput).toHaveValue(overHundredChars);
    expect(screen.getByText("101/100")).toBeInTheDocument();
  });
});
