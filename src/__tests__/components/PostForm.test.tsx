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
import { type CreatePostInput } from "~/server/api/routers/post";

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
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockRouter: AppRouterInstance = {
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock("~/utils/api", () => ({
  api: {
    emotionTag: {
      getAll: {
        useQuery: () => ({
          data: mockEmotionTags,
          isLoading: false,
          error: null,
        }),
      },
    },
    post: {
      create: {
        useMutation: (options: MutationOptions) => ({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          ...options,
        }),
      },
    },
    useContext: jest.fn(),
  },
}));

describe("PostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(mockRouter);
    jest.mocked(api.useContext).mockReturnValue({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    });
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
    const mockMutate = jest.fn();
    const mockSuccess = jest.fn();

    jest.mocked(api.post.create.useMutation).mockImplementation((options) => ({
      mutate: (data: CreatePostInput) => {
        mockMutate(data);
        options.onSuccess?.();
      },
      isPending: false,
    }));

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
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("投稿が失敗した場合、エラーメッセージが表示されること", async () => {
    const mockMutate = jest.fn().mockImplementation(() => {
      throw new Error("FORBIDDEN");
    });

    jest.mocked(api.post.create.useMutation).mockImplementation((options) => ({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: { data: { code: "FORBIDDEN" } },
      onError: (error: { data: { code: string } }) => {
        options.onError?.(error);
      },
    }));

    renderWithProviders(<PostForm />);
    const contentInput = screen.getByLabelText(
      "メッセージ",
    ) as HTMLTextAreaElement;
    const emotionSelect = screen.getByLabelText(
      "今の気持ち",
    ) as HTMLSelectElement;

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("1日1回までしか投稿できません。"),
      ).toBeInTheDocument();
    });
  });

  it("投稿中はローディング表示が表示されること", () => {
    jest.mocked(api.post.create.useMutation).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    renderWithProviders(<PostForm />);
    const submitButton = screen.getByRole("button", { name: /投稿/ });
    expect(submitButton).toHaveTextContent("投稿中...");
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
    const mockMutate = jest.fn();

    jest.mocked(api.post.create.useMutation).mockImplementation((options) => ({
      mutate: (data: CreatePostInput) => {
        mockMutate(data);
        options.onSuccess?.();
      },
      isPending: false,
    }));

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("メッセージ");
    const emotionSelect = screen.getByLabelText("今の気持ち");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionSelect, { target: { value: "1" } });

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(contentInput).toHaveValue("");
      expect(emotionSelect).toHaveValue("");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
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
