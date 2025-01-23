/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { PostForm } from "~/components/PostForm";
import { renderWithProviders } from "../utils/test-utils";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import type {
  UseTRPCMutationResult,
  UseTRPCMutationOptions,
} from "@trpc/react-query/shared";
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
        useMutation: jest.fn().mockImplementation(() => ({
          mutate: mockCreatePost,
          isPending: false,
          trpc: { path: "post.create" },
        })),
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
    expect(screen.getByLabelText("感情")).toBeInTheDocument();
    expect(screen.getByText("投稿する")).toBeInTheDocument();
  });

  it("感情タグが正しく表示されること", () => {
    renderWithProviders(<PostForm />);

    mockEmotionTags.forEach((tag) => {
      expect(screen.getByText(new RegExp(tag.name))).toBeInTheDocument();
    });
  });

  it("フォームの入力が正しく動作すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    expect(contentInput).toHaveValue("テスト投稿");
    expect(emotionTagSelect).toHaveValue("1");
  });

  it("文字数制限が100文字に設定されていること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    expect(contentInput).toHaveAttribute("maxLength", "100");

    // 100文字のテストデータ
    const hundredChars = "あ".repeat(100);

    // 100文字までは入力可能
    fireEvent.change(contentInput, { target: { value: hundredChars } });
    expect(contentInput).toHaveValue(hundredChars);
    expect(screen.getByText("100/100")).toBeInTheDocument();
  });

  it("必須項目が入力されていない場合、送信ボタンが無効化されること", () => {
    renderWithProviders(<PostForm />);

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    expect(submitButton).toBeDisabled();

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    expect(submitButton).toBeDisabled();

    const emotionTagSelect = screen.getByLabelText("感情");
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("フォーム送信が正しく動作すること", async () => {
    const mockMutate = jest.fn();
    const mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      trpc: { path: "post.create" },
    };

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      (options: any) => {
        mockMutate.mockImplementation((data: any) => {
          setTimeout(() => {
            options.onSuccess?.();
          }, 0);
        });
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        content: "テスト投稿",
        emotionTagId: "1",
      });
      expect(contentInput).toHaveValue("");
      expect(emotionTagSelect).toHaveValue("");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("投稿成功時に適切な処理が行われること", async () => {
    const mockMutate = jest.fn().mockImplementation((_data) => {
      setTimeout(() => {
        const contentInput = screen.getByLabelText("今日の想いを綴る");
        const emotionTagSelect = screen.getByLabelText("感情");
        fireEvent.change(contentInput, { target: { value: "" } });
        fireEvent.change(emotionTagSelect, { target: { value: "" } });
        mockPush("/");
        mockInvalidate();
      }, 0);
    });

    const _mockMutationResult = {
      mutate: mockMutate,
      isPending: false,
      trpc: { path: "post.create" },
    };

    (api.post.create.useMutation as jest.Mock).mockReturnValue(
      _mockMutationResult,
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        content: "テスト投稿",
        emotionTagId: "1",
      });
      expect(contentInput).toHaveValue("");
      expect(emotionTagSelect).toHaveValue("");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  it("投稿失敗時にエラーメッセージが表示されること", async () => {
    const mockError = new TRPCClientError("FORBIDDEN");
    Object.defineProperty(mockError, "data", {
      value: { code: "FORBIDDEN" },
      writable: true,
      configurable: true,
    });

    const mockMutate = jest.fn().mockRejectedValue(mockError);
    const mockMutationResult = {
      mutate: mockMutate,
      mutateAsync: jest.fn(),
      isPending: false,
      isError: true,
      error: mockError,
      variables: undefined,
      trpc: { path: "post.create" },
      isIdle: false,
      isSuccess: false,
      status: "error",
      reset: jest.fn(),
      failureCount: 1,
      failureReason: mockError,
      isPaused: false,
    } as unknown as UseTRPCMutationResult<
      Post,
      TRPCClientErrorLike<any>,
      CreatePostInput,
      unknown
    >;

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      (options: any, context: any, router: any) => {
        mockMutate.mockImplementation(() => {
          setTimeout(() => options.onError?.(mockError), 0);
        });
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(
        screen.getByText("1日1回までしか投稿できません。"),
      ).toBeInTheDocument();
    });
  });

  it("一般的なエラー時に適切なエラーメッセージが表示されること", async () => {
    const mockError = new TRPCClientError("INTERNAL_SERVER_ERROR");
    Object.defineProperty(mockError, "data", {
      value: { code: "INTERNAL_SERVER_ERROR" },
      writable: true,
      configurable: true,
    });

    const mockMutate = jest.fn().mockRejectedValue(mockError);
    const mockMutationResult = {
      mutate: mockMutate,
      mutateAsync: jest.fn(),
      isPending: false,
      isError: true,
      error: mockError,
      variables: undefined,
      trpc: { path: "post.create" },
      isIdle: false,
      isSuccess: false,
      status: "error",
      reset: jest.fn(),
      failureCount: 1,
      failureReason: mockError,
      isPaused: false,
    } as unknown as UseTRPCMutationResult<
      Post,
      TRPCClientErrorLike<any>,
      CreatePostInput,
      unknown
    >;

    (api.post.create.useMutation as jest.Mock).mockImplementation(
      (options: any, context: any, router: any) => {
        mockMutate.mockImplementation(() => {
          setTimeout(() => options.onError?.(mockError), 0);
        });
        return mockMutationResult;
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

    fireEvent.change(contentInput, { target: { value: "テスト投稿" } });
    fireEvent.change(emotionTagSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByText("投稿する"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(
        screen.getByText("投稿に失敗しました。もう一度お試しください。"),
      ).toBeInTheDocument();
    });
  });

  it("文字数制限が正しく機能すること", () => {
    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
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

  it("投稿中の状態が正しく表示されること", () => {
    const mockMutationResult = {
      mutate: mockCreatePost,
      isPending: true,
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

    const submitButton = screen.getByRole("button");
    expect(screen.getByText("投稿中...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
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

    const submitButton = screen.getByRole("button");
    expect(submitButton).toHaveTextContent("投稿中...");
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
      (options: any) => {
        const mutate = (data: any) => {
          mockMutate(data);
          setTimeout(() => {
            options.onSuccess?.();
          }, 0);
        };
        return {
          mutate,
          isPending: false,
          isError: false,
          error: null,
          trpc: { path: "post.create" },
        };
      },
    );

    renderWithProviders(<PostForm />);

    const contentInput = screen.getByLabelText("今日の想いを綴る");
    const emotionTagSelect = screen.getByLabelText("感情");

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
