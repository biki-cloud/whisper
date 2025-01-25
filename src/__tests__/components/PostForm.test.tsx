/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import { usePostForm } from "~/hooks/post/usePostForm";

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

const mockEmotionTags = EMOTION_TAGS.map((tag, index) => ({
  id: String(index + 1),
  name: tag.name,
  emoji: tag.emoji,
}));

const mockPush = jest.fn();
const mockInvalidate = jest.fn();
const mockOnSuccess = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();
const mockUsePostForm = jest.fn();

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("~/utils/api", () => ({
  api: {
    emotionTag: {
      getAll: {
        useQuery: mockUseQuery,
      },
    },
    post: {
      create: {
        useMutation: mockUseMutation,
      },
    },
    useContext: () => ({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}));

jest.mock("~/hooks/post/usePostForm", () => ({
  usePostForm: () => mockUsePostForm(),
}));

describe("PostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      emotionTags: mockEmotionTags,
      isDisabled: true,
      isPending: false,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /投稿/i })).toBeInTheDocument();
    expect(screen.getByLabelText("今の気持ち")).toBeInTheDocument();
  });

  it("テキストエリアに入力できること", async () => {
    const mockHandleContentChange = jest.fn();
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: false,
      handleContentChange: mockHandleContentChange,
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      emotionTags: mockEmotionTags,
      isLoading: false,
    });

    renderWithProviders(<PostForm />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "テストメッセージ");
    expect(mockHandleContentChange).toHaveBeenCalled();
  });

  it("エラーメッセージが表示されること", () => {
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: "エラーメッセージ",
      charCount: 0,
      isDisabled: true,
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      emotionTags: mockEmotionTags,
      isLoading: false,
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByText("エラーメッセージ")).toBeInTheDocument();
  });

  it("フォーム送信が正しく動作すること", async () => {
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    mockUsePostForm.mockReturnValue({
      content: "テストメッセージ",
      emotionTagId: "1",
      error: null,
      charCount: 7,
      isDisabled: false,
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
      handleSubmit: mockHandleSubmit,
      emotionTags: mockEmotionTags,
      isLoading: false,
    });

    renderWithProviders(<PostForm />);
    const form = screen.getByTestId("post-form");
    fireEvent.submit(form);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("文字数制限が正しく機能すること", async () => {
    const mockHandleContentChange = jest.fn();
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: true,
      handleContentChange: mockHandleContentChange,
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      emotionTags: mockEmotionTags,
      isLoading: false,
    });

    renderWithProviders(<PostForm />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "a".repeat(100));
    expect(mockHandleContentChange).toHaveBeenCalled();
    expect(screen.getByText("0/100")).toBeInTheDocument();
  });

  it("投稿中はローディング表示が表示されること", () => {
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      emotionTags: mockEmotionTags,
      isDisabled: true,
      isPending: true,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByText(/投稿中/)).toBeInTheDocument();
  });

  it("投稿ボタンの無効化が正しく機能すること", () => {
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      emotionTags: mockEmotionTags,
      isDisabled: true,
      isPending: false,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });

    renderWithProviders(<PostForm />);
    expect(screen.getByRole("button", { name: /投稿/i })).toBeDisabled();
  });

  it("感情タグが正しく表示されること", () => {
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      emotionTags: mockEmotionTags,
      isDisabled: true,
      isPending: false,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });

    renderWithProviders(<PostForm />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent("感情を選択してください");
  });
});
