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

const mockPush = jest.fn();
const mockInvalidate = jest.fn();
const mockOnSuccess = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();
const mockUsePostForm = jest.fn();

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
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
  },
}));

jest.mock("~/hooks/post/usePostForm", () => ({
  usePostForm: () => mockUsePostForm(),
}));

describe("PostForm", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUsePostForm.mockReturnValue({
      content: "",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: true,
      isPending: false,
      handleSubmit: jest.fn(),
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
    });
  });

  it("フォームが正しくレンダリングされること", () => {
    render(<PostForm />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "投稿する" }),
    ).toBeInTheDocument();
  });

  it("メッセージを入力できること", async () => {
    const mockHandleContentChange = jest.fn((e) => {
      e.target.value = "テストメッセージ";
    });
    mockUsePostForm.mockReturnValue({
      content: "テストメッセージ",
      emotionTagId: "",
      error: null,
      charCount: 0,
      isDisabled: false,
      handleContentChange: mockHandleContentChange,
      setEmotionTagId: jest.fn(),
      handleSubmit: jest.fn(),
      isPending: false,
    });

    render(<PostForm />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "テストメッセージ");

    expect(textarea).toHaveValue("テストメッセージ");
  });

  it("感情を選択できること", async () => {
    render(<PostForm />);
    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    const option = screen.getByRole("option", {
      name: `${EMOTION_TAGS[0].emoji} ${EMOTION_TAGS[0].name}`,
    });
    expect(option).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示されること", () => {
    mockUsePostForm.mockReturnValue({
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

    render(<PostForm />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "感情を選択してください",
    );
  });

  it("フォームが正しくレンダリングされること", () => {
    render(<PostForm />);

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
    mockUsePostForm.mockReturnValue({
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
    mockUsePostForm.mockReturnValue({
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
    mockUsePostForm.mockReturnValue({
      content: "テストメッセージ",
      emotionTagId: EMOTION_TAGS[0].name,
      error: null,
      charCount: 7,
      isDisabled: false,
      handleContentChange: jest.fn(),
      setEmotionTagId: jest.fn(),
      handleSubmit: mockHandleSubmit,
      isPending: false,
    });

    renderWithProviders(<PostForm />);
    const form = screen.getByTestId("post-form");
    fireEvent.submit(form);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
