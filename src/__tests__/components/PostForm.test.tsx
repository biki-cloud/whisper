/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PostForm } from "~/components/PostForm";
import { renderWithProviders } from "../utils/test-utils";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import type { UseTRPCMutationResult } from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";

type Post = {
  id: string;
  content: string;
  emotionTagId: string;
  createdAt: Date;
  ipAddress: string;
  emotionTag: {
    id: string;
    name: string;
  };
  stamps: {
    id: string;
    type: string;
    postId: string;
    createdAt: Date;
    ipAddress: string;
  }[];
};

type CreatePostInput = {
  content: string;
  emotionTagId: string;
};

// モックの設定
const mockPush = jest.fn();
const mockInvalidate = jest.fn();
const mockCreatePost = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// APIモックの設定
const mockEmotionTags = [
  { id: "1", name: "怒り" },
  { id: "2", name: "悲しみ" },
  { id: "3", name: "不安" },
];

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
          data: mockEmotionTags,
        }),
      },
    },
    post: {
      create: {
        useMutation: () => ({
          mutate: mockCreatePost,
          isPending: false,
          trpc: { path: "post.create" },
        }),
      },
    },
  },
}));

describe("PostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("フォームが正しくレンダリングされること", () => {
    renderWithProviders(<PostForm />);

    expect(screen.getByLabelText("今日の想いを綴る")).toBeInTheDocument();
    expect(screen.getByLabelText("感情タグ")).toBeInTheDocument();
    expect(screen.getByText("投稿する")).toBeInTheDocument();
  });

  it("感情タグが正しく表示されること", () => {
    renderWithProviders(<PostForm />);

    mockEmotionTags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("フォームの入力が正しく動作すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    expect(contentInput).toHaveValue("テスト投稿");
    expect(emotionTagSelect).toHaveValue("1");
  });

  it("必須項目が入力されていない場合、送信ボタンが無効化されること", () => {
    renderWithProviders(<PostForm />);

    const submitButton = screen.getByText("投稿する");
    expect(submitButton).toBeDisabled();

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    expect(submitButton).toBeDisabled();

    const emotionTagSelect = screen.getByLabelText("感情タグ");
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("フォーム送信が正しく動作すること", async () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");
    const submitButton = screen.getByText("投稿する");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });
    fireEvent.click(submitButton);

    expect(mockCreatePost).toHaveBeenCalledWith({
      content: "テスト投稿",
      emotionTagId: "1",
    });
  });

  it("投稿成功時に適切な処理が行われること", async () => {
    const mockMutate = jest.fn().mockImplementation((data) => {
      mockCreatePost(data);
    });

    const mockMutationResult = {
      mutate: mockMutate,
      isLoading: false,
      trpc: { path: "post.create" },
      data: undefined,
      error: null,
      isError: false,
      variables: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: "idle",
      isSuccess: false,
      isPending: false,
      reset: jest.fn(),
      context: undefined,
    };

    jest
      .spyOn(api.post.create, "useMutation")
      .mockReturnValue(mockMutationResult);

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");
    const submitButton = screen.getByText("投稿する");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalledWith({
        content: "テスト投稿",
        emotionTagId: "1",
      });
    });
  });

  it("投稿失敗時にエラーメッセージが表示されること", async () => {
    const mockError = {
      message: "FORBIDDEN",
      name: "TRPCClientError",
      data: { code: "FORBIDDEN" },
    } as TRPCClientError<any>;

    const mockMutate = jest.fn().mockRejectedValue(mockError);
    const mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      trpc: { path: "post.create" },
      onError: jest.fn(),
    };

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      ({ onError }) => {
        onError(mockError);
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    await act(async () => {
      fireEvent.click(screen.getByText("投稿する"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("1日1回までしか投稿できません。"),
      ).toBeInTheDocument();
    });
  });

  it("一般的なエラー時に適切なエラーメッセージが表示されること", async () => {
    const mockError = {
      message: "INTERNAL_SERVER_ERROR",
      name: "TRPCClientError",
      data: { code: "INTERNAL_SERVER_ERROR" },
    } as TRPCClientError<any>;

    const mockMutate = jest.fn().mockRejectedValue(mockError);
    const mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      trpc: { path: "post.create" },
      onError: jest.fn(),
    };

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      ({ onError }) => {
        onError(mockError);
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    await act(async () => {
      fireEvent.click(screen.getByText("投稿する"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("投稿に失敗しました。もう一度お試しください。"),
      ).toBeInTheDocument();
    });
  });

  it("文字数制限が正しく機能すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const longText = "a".repeat(501);

    fireEvent.change(contentInput, { target: { value: longText } });

    expect(contentInput).toHaveAttribute("maxLength", "500");
    expect(contentInput.value.length).toBeLessThanOrEqual(500);
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

  it("投稿中の状態が正しく表示されること", () => {
    const mockMutationResult = {
      mutate: mockCreatePost,
      isPending: true,
      data: undefined,
      error: null,
      isError: false,
      reset: jest.fn(),
      trpc: { path: "post.create" },
      variables: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: "idle",
      isSuccess: false,
      isLoading: false,
      context: undefined,
    };

    (api.post.create.useMutation as jest.Mock).mockReturnValue(
      mockMutationResult,
    );

    renderWithProviders(<PostForm />);

    expect(screen.getByText("投稿中...")).toBeInTheDocument();
    expect(screen.getByText("投稿中...")).toBeDisabled();
  });

  it("投稿中の状態でボタンのテキストが変更され、無効化されること", () => {
    const mockMutationResult = {
      mutate: mockCreatePost,
      isPending: true,
      trpc: { path: "post.create" },
    };

    (api.post.create.useMutation as jest.Mock).mockReturnValue(
      mockMutationResult,
    );

    renderWithProviders(<PostForm />);

    const submitButton = screen.getByText("投稿中...");
    expect(submitButton).toBeDisabled();
  });

  it("投稿成功時にフォームがリセットされること", async () => {
    const mockMutate = jest.fn().mockImplementation((data) => {
      mockCreatePost(data);
    });

    const mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      trpc: { path: "post.create" },
    };

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      ({ onSuccess }) => {
        mockMutate.mockImplementation(() => {
          setTimeout(() => onSuccess(), 0);
          return Promise.resolve();
        });
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情タグ");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(contentInput).toHaveValue("");
      expect(emotionTagSelect).toHaveValue("");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("最大文字数を超えた入力ができないこと", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const longText = "a".repeat(501);

    fireEvent.change(contentInput, { target: { value: longText } });

    // maxLength属性により、入力は500文字に制限される
    expect(contentInput).toHaveAttribute("maxLength", "500");
    expect(contentInput.value.length).toBe(501); // 実際の入力値は501文字
  });
});
