/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostForm } from "~/components/PostForm";
import { renderWithProviders } from "~/utils/test-utils";
import { api } from "~/utils/test-utils";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import type {
  UseTRPCMutationResult,
  UseTRPCMutationOptions,
} from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { z } from "zod";
import { type PropsWithChildren } from "react";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePostForm } from "~/hooks/post/usePostForm";

// テスト用の感情タグを定義
const mockEmotionTags = [
  {
    id: "1",
    name: "怒り",
    emoji: "😠",
  },
  {
    id: "2",
    name: "悲しみ",
    emoji: "😢",
  },
] as const;

// テストで使用する最初の感情タグを定数として定義
const firstEmotionTag = mockEmotionTags[0];

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
const mockOnSuccess = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();
const mockUsePostForm = jest.fn();

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({
      post: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    })),
    post: {
      create: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isPending: false,
        })),
      },
    },
    emotionTag: {
      getAll: {
        useQuery: () => ({
          data: mockEmotionTags,
          isLoading: false,
          error: null,
        }),
      },
    },
  },
}));

jest.mock("~/hooks/post/usePostForm", () => ({
  usePostForm: jest.fn(() => ({
    formState: {
      content: "",
      emotionTagId: "",
    },
    content: "",
    emotionTagId: "",
    setContent: jest.fn(),
    setEmotionTagId: jest.fn(),
    handleSubmit: jest.fn(),
    handleContentChange: jest.fn(),
    isLoading: false,
    isPending: false,
    error: null,
    charCount: 0,
    isDisabled: false,
  })),
}));

describe("PostForm", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "投稿する" }),
    ).toBeInTheDocument();
  });

  it("メッセージを入力できること", async () => {
    const mockHandleContentChange = jest.fn();
    (usePostForm as jest.Mock).mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: false,
      handleContentChange: mockHandleContentChange,
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "テストメッセージ");
    expect(mockHandleContentChange).toHaveBeenCalled();
  });

  it("感情を選択できること", async () => {
    renderWithProviders(<PostForm />);
    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    const option = screen.getByRole("option", {
      name: `${firstEmotionTag.emoji} ${firstEmotionTag.name}`,
    });
    expect(option).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示されること", () => {
    (usePostForm as jest.Mock).mockReturnValue({
      content: "",
      emotionTagId: "",
      error: "感情を選択してください",
      charCount: 0,
      isDisabled: true,
      isPending: false,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "感情を選択してください",
    );
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "投稿する" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("メッセージを入力してください"),
    ).toBeInTheDocument();
  });

  it("テキストエリアに入力できること", async () => {
    const mockHandleContentChange = jest.fn();
    (usePostForm as jest.Mock).mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: false,
      handleContentChange: mockHandleContentChange,
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "テストメッセージ");
    expect(mockHandleContentChange).toHaveBeenCalled();
  });

  it("エラーメッセージが表示されること", () => {
    (usePostForm as jest.Mock).mockReturnValue({
      content: "",
      emotionTagId: "",
      error: "エラーメッセージ",
      charCount: 0,
      isDisabled: true,
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByRole("alert")).toHaveTextContent("エラーメッセージ");
  });

  it("フォーム送信が正しく動作すること", async () => {
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    (usePostForm as jest.Mock).mockReturnValue({
      content: "テストメッセージ",
      emotionTagId: firstEmotionTag.id,
      error: null,
      charCount: 7,
      isDisabled: false,
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
      handleSubmit: mockHandleSubmit,
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    const submitButton = screen.getByRole("button", { name: "投稿する" });
    await userEvent.click(submitButton);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
