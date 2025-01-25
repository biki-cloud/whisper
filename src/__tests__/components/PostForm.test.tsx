/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostForm } from "~/components/PostForm";
import { renderWithProviders } from "../utils/test-utils";
import { api } from "../utils/test-utils";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import type {
  UseTRPCMutationResult,
  UseTRPCMutationOptions,
} from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { EMOTION_TAGS } from "~/constants/emotions";
import { z } from "zod";
import { type PropsWithChildren } from "react";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { vi } from "vitest";

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  emotionTagId: z.string(),
});

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

const mockPush = jest.fn();
const mockInvalidate = jest.fn();

const mockEmotionTags = EMOTION_TAGS.map((tag, index) => ({
  id: String(index + 1),
  name: tag.name,
  emoji: tag.emoji,
}));

type MutationOptions = {
  onSuccess?: () => void;
  onError?: (error: { data: { code: string } }) => void;
};

// モックの設定
vi.mock("next/navigation", () => ({
  useRouter: () =>
    ({
      push: vi.fn(),
    }) as Partial<AppRouterInstance>,
}));

const mockRouter: AppRouterInstance = {
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
};

vi.mock("~/utils/api", () => ({
  api: {
    emotionTag: {
      getAll: {
        useQuery: vi.fn(),
      },
    },
    post: {
      create: {
        useMutation: vi.fn(),
      },
    },
    useContext: vi.fn(() => ({
      post: {
        getAll: {
          invalidate: vi.fn(),
        },
      },
    })),
  },
}));

describe("PostForm", () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate = jest.fn();
    vi.mocked(api.post.create.useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(api.emotionTag.getAll.useQuery).mockReturnValue({
      data: mockEmotionTags,
      isLoading: false,
      error: null,
    } as any);
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);
    expect(screen.getByLabelText("メッセージ")).toBeInTheDocument();
    expect(screen.getByLabelText("今の気持ち")).toBeInTheDocument();
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
    render(<PostForm />);

    // フォームに値を入力
    const textarea = screen.getByLabelText("メッセージ");
    await userEvent.type(textarea, "テストメッセージ");

    // 感情タグを選択
    const emotionSelect = screen.getByLabelText("今の気持ち");
    await userEvent.click(emotionSelect);
    const emotionOption = screen.getByText("嬉しい");
    await userEvent.click(emotionOption);

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).not.toBeDisabled();
    await fireEvent.click(submitButton);

    // mutateが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        content: "テストメッセージ",
        emotionTagId: "1",
      });
    });

    // invalidateとpushが呼ばれたことを確認
    await waitFor(() => {
      expect(
        vi.mocked(api.post.create.useMutation).mock.calls[0][0].onSuccess,
      ).toHaveBeenCalled();
      expect(
        vi.mocked(api.emotionTag.getAll.useQuery).mock.calls[0][0].onSuccess,
      ).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("投稿が失敗した場合、エラーメッセージが表示されること", async () => {
    mockMutate.mockRejectedValue(new TRPCClientError("投稿に失敗しました"));

    render(<PostForm />);

    // フォームに値を入力
    const textarea = screen.getByLabelText("メッセージ");
    await userEvent.type(textarea, "テストメッセージ");

    // 感情タグを選択
    const emotionSelect = screen.getByLabelText("今の気持ち");
    await userEvent.click(emotionSelect);
    const emotionOption = screen.getByText("嬉しい");
    await userEvent.click(emotionOption);

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).not.toBeDisabled();
    await fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(
        screen.getByText("投稿に失敗しました。もう一度お試しください。"),
      ).toBeInTheDocument();
    });
  });

  it("投稿中はローディング表示が表示されること", () => {
    vi.mocked(api.post.create.useMutation).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
    });

    renderWithProviders(<PostForm />);

    // ローディング中のテキストが表示されることを確認
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

  it("感情タグが正しく表示されること", async () => {
    renderWithProviders(<PostForm />);
    const emotionSelect = screen.getByLabelText("今の気持ち");
    fireEvent.click(emotionSelect);

    await waitFor(() => {
      EMOTION_TAGS.forEach((tag) => {
        const option = screen.getByText(
          new RegExp(`${tag.emoji}.*${tag.name}`),
        );
        expect(option).toBeInTheDocument();
      });
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
    render(<PostForm />);

    // フォームに値を入力
    const textarea = screen.getByLabelText("メッセージ");
    await userEvent.type(textarea, "テストメッセージ");

    // 感情タグを選択
    const emotionSelect = screen.getByLabelText("今の気持ち");
    await userEvent.click(emotionSelect);
    const emotionOption = screen.getByText("嬉しい");
    await userEvent.click(emotionOption);

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).not.toBeDisabled();
    await fireEvent.click(submitButton);

    // mutateが呼ばれることを確認
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        content: "テストメッセージ",
        emotionTagId: "1",
      });
    });

    // フォームがリセットされることを確認
    await waitFor(() => {
      expect(textarea).toHaveValue("");
      expect(emotionSelect).toHaveValue("");
    });
  });

  it("最大文字数を超えた入力ができないこと", () => {
    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText("メッセージ");

    // 100文字の入力
    const hundredChars = "a".repeat(100);
    fireEvent.change(contentInput, { target: { value: hundredChars } });
    expect(contentInput).toHaveValue(hundredChars);
    expect(screen.getByText("100/100")).toBeInTheDocument();

    // 101文字の入力を試みる
    const overHundredChars = "a".repeat(101);
    fireEvent.change(contentInput, { target: { value: overHundredChars } });
    // maxLength属性により、入力は100文字に制限される
    expect(contentInput).toHaveValue(hundredChars);
    expect(screen.getByText("100/100")).toBeInTheDocument();
  });
});
