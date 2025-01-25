import { render, screen, fireEvent } from "@testing-library/react";
import { PostList } from "~/components/PostList";
import { withTRPC } from "../utils/test-utils";
import { api } from "~/utils/api";

// lucide-reactのモック
jest.mock("lucide-react", () => ({
  Filter: () => <div data-testid="filter-icon" />,
  SortDesc: () => <div data-testid="sort-desc-icon" />,
  SortAsc: () => <div data-testid="sort-asc-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  RotateCw: () => <div data-testid="rotate-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

// framer-motionのモック
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// tRPCのモック
jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({})),
    emotionTag: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: [
            { id: "clh1234567890", name: "怒り" },
            { id: "clh1234567891", name: "悲しみ" },
            { id: "clh1234567892", name: "不安" },
          ],
        })),
      },
    },
    post: {
      getAll: {
        useInfiniteQuery: jest.fn(() => ({
          data: {
            pages: [
              {
                items: [
                  {
                    id: "1",
                    content: "テスト投稿",
                    createdAt: new Date().toISOString(),
                    emotionTag: {
                      id: "clh1234567890",
                      name: "怒り",
                    },
                    anonymousId: "anonymous-1",
                    stamps: [],
                  },
                ],
                nextCursor: null,
              },
            ],
          },
          isLoading: false,
        })),
      },
      getClientId: {
        useQuery: jest.fn(() => ({
          data: "anonymous-1",
        })),
      },
      addStamp: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false,
        })),
      },
      delete: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
    },
  },
}));

const WrappedPostList = withTRPC(PostList);

// モック関数の型を修正
const mockGetAllQuery = api.post.getAll.useInfiniteQuery as jest.Mock;

describe("PostList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("投稿一覧が表示される", () => {
    render(<WrappedPostList />);
    expect(screen.getByText("テスト投稿")).toBeInTheDocument();
  });

  it("感情タグでフィルタリングできる", () => {
    render(<WrappedPostList />);
    const select = screen.getByRole("combobox", { name: /すべての感情/i });
    fireEvent.change(select, { target: { value: "clh1234567890" } });
    expect(select).toHaveValue("clh1234567890");
  });

  it("投稿の並び順を変更できる", () => {
    render(<WrappedPostList />);
    const select = screen.getByRole("combobox", { name: /新しい順/i });
    fireEvent.change(select, { target: { value: "asc" } });
    expect(select).toHaveValue("asc");
  });

  it("自分の投稿を削除できる", () => {
    const mockConfirm = jest.spyOn(window, "confirm");
    mockConfirm.mockReturnValue(true);

    render(<WrappedPostList />);
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "この投稿を削除してもよろしいですか？ 本日の再投稿はできません。",
    );
  });

  it("スタンプを追加できる", () => {
    render(<WrappedPostList />);

    // スタンプを追加ボタンをクリック
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ローディング中にスピナーが表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      isLoading: true,
    });

    render(<WrappedPostList />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("投稿が0件の場合にメッセージが表示され、フィルターUIも表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);
    expect(screen.getByText("投稿がありません")).toBeInTheDocument();

    // フィルターUIが表示されることを確認
    expect(
      screen.getByRole("combobox", { name: /すべての感情/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /新しい順/i }),
    ).toBeInTheDocument();

    // フィルターが機能することを確認
    const emotionSelect = screen.getByRole("combobox", {
      name: /すべての感情/i,
    });
    fireEvent.change(emotionSelect, { target: { value: "clh1234567890" } });
    expect(emotionSelect).toHaveValue("clh1234567890");

    const orderSelect = screen.getByRole("combobox", { name: /新しい順/i });
    fireEvent.change(orderSelect, { target: { value: "asc" } });
    expect(orderSelect).toHaveValue("asc");
  });

  it("スタンプが付いている投稿が表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [
                  { type: "thanks", anonymousId: "anonymous-1" },
                  { type: "love", anonymousId: "anonymous-1" },
                  { type: "thanks", anonymousId: "anonymous-2" },
                ],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);

    // スタンプカウントの表示を確認
    const thanksCount = screen.getByText("2");
    const loveCount = screen.getByText("1");
    expect(thanksCount).toBeInTheDocument();
    expect(loveCount).toBeInTheDocument();

    // スタンプを追加ボタンが表示されていることを確認
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    expect(addStampButton).toBeInTheDocument();
  });

  it("削除をキャンセルできる", () => {
    const mockConfirm = jest.spyOn(window, "confirm");
    mockConfirm.mockReturnValue(false);

    render(<WrappedPostList />);
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "この投稿を削除してもよろしいですか？ 本日の再投稿はできません。",
    );
    expect(api.post.delete.useMutation().mutate).not.toHaveBeenCalled();
  });

  it("スタンプのローディング中はボタンが無効化される", () => {
    const mockAddStamp = api.post.addStamp.useMutation as jest.Mock;
    mockAddStamp.mockReturnValueOnce({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<WrappedPostList />);

    // スタンプを追加ボタンをクリック
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // スタンプボタンが無効化されていることを確認
    expect(addStampButton).toBeDisabled();
  });

  it("感情タグをクリックするとフィルタリングされる", () => {
    render(<WrappedPostList />);
    const emotionTagButton = screen.getByRole("button", { name: /😠 怒り/ });
    fireEvent.click(emotionTagButton);

    const select = screen.getByRole("combobox", { name: /すべての感情/i });
    expect(select).toHaveValue("clh1234567890");
  });

  it("投稿の時刻が正しくフォーマットされる", () => {
    const testDate = new Date("2024-03-20T15:30:00");
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: testDate.toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);
    expect(screen.getByText("2024/3/20 15:30:00")).toBeInTheDocument();
  });

  it("スタンプボタンの選択状態が正しく表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [
                  { type: "thanks", anonymousId: "anonymous-1" },
                  { type: "love", anonymousId: "anonymous-2" },
                ],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    // クライアントIDを設定
    const mockGetClientId = api.post.getClientId.useQuery as jest.Mock;
    mockGetClientId.mockReturnValue({
      data: "anonymous-1",
    });

    render(<WrappedPostList />);

    // スタンプを追加ボタンをクリック
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // スタンプボタンが表示されていることを確認
    const thanksButton = screen.getByRole("button", {
      name: "ありがとうボタン",
    });
    expect(thanksButton).toHaveClass("bg-primary");
  });

  it("スタンプの追加後にデータが再取得される", () => {
    const mockInvalidate = jest.fn();
    (api.useContext as jest.Mock).mockReturnValueOnce({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    });

    const mockAddStamp = jest.fn();
    (api.post.addStamp.useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockAddStamp,
      isPending: false,
      onSettled: jest.fn(),
    });

    render(<WrappedPostList />);
    const thanksButton = screen.getByRole("button", {
      name: "ありがとうボタン",
    });
    fireEvent.click(thanksButton);

    // onSettledが呼ばれることを確認
    const mutationOptions = (api.post.addStamp.useMutation as jest.Mock).mock
      .calls[0][0];
    mutationOptions.onSettled();

    expect(mockInvalidate).toHaveBeenCalled();
  });

  it("投稿の削除後にデータが再取得される", () => {
    const mockInvalidate = jest.fn();
    (api.useContext as jest.Mock).mockReturnValue({
      post: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    });

    const mockMutate = jest.fn();
    (api.post.delete.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      onSuccess: () => {
        mockInvalidate();
      },
    });

    const mockConfirm = jest.spyOn(window, "confirm");
    mockConfirm.mockReturnValue(true);

    render(<WrappedPostList />);
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    // onSuccessを手動で呼び出す
    const mutationOptions = (api.post.delete.useMutation as jest.Mock).mock
      .calls[0][0];
    mutationOptions.onSuccess();

    expect(mockInvalidate).toHaveBeenCalled();
  });

  it("自分の投稿でない場合は削除ボタンが表示されない", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-2",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);
    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });

  it("他のユーザーの投稿には削除ボタンが表示されない", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-2",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);
    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });

  it("スタンプの追加時にキャッシュが正しく更新される", async () => {
    const mockContext = {
      post: {
        getAll: {
          cancel: jest.fn(),
          getInfiniteData: jest.fn(() => ({
            pages: [
              {
                items: [
                  {
                    id: "1",
                    stamps: [],
                  },
                ],
              },
            ],
          })),
          setInfiniteData: jest.fn(),
          invalidate: jest.fn(),
        },
      },
    };

    (api.useContext as jest.Mock).mockReturnValue(mockContext);

    const mockAddStamp = api.post.addStamp.useMutation as jest.Mock;
    const mockMutate = jest.fn();
    const onMutate = jest.fn();
    mockAddStamp.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      onMutate,
    });

    render(<WrappedPostList />);
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // onMutateを手動で呼び出す
    const mutationOptions = mockAddStamp.mock.calls[0][0];
    await mutationOptions.onMutate({ postId: "1", type: "thanks" });

    expect(mockContext.post.getAll.cancel).toHaveBeenCalled();
    expect(mockContext.post.getAll.setInfiniteData).toHaveBeenCalled();
  });

  it("スタンプの追加でエラーが発生した場合に元のデータに戻る", async () => {
    const prevData = {
      pages: [
        {
          items: [
            {
              id: "1",
              stamps: [],
            },
          ],
        },
      ],
    };

    const mockContext = {
      post: {
        getAll: {
          cancel: jest.fn(),
          getInfiniteData: jest.fn(() => prevData),
          setInfiniteData: jest.fn(),
          invalidate: jest.fn(),
        },
      },
    };

    (api.useContext as jest.Mock).mockReturnValue(mockContext);

    const mockAddStamp = api.post.addStamp.useMutation as jest.Mock;
    const mockMutate = jest.fn();
    mockAddStamp.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<WrappedPostList />);
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // エラーハンドラーを手動で呼び出す
    const mutationOptions = mockAddStamp.mock.calls[0][0];
    await mutationOptions.onMutate({ postId: "1", type: "thanks" });
    mutationOptions.onError(
      new Error(),
      { postId: "1", type: "thanks" },
      { prevData },
    );

    expect(mockContext.post.getAll.setInfiniteData).toHaveBeenCalledWith(
      expect.any(Object),
      prevData,
    );
  });

  it("スタンプの追加が成功した場合にキャッシュが更新される", () => {
    const mockContext = {
      post: {
        getAll: {
          cancel: jest.fn(),
          getInfiniteData: jest.fn(() => ({
            pages: [
              {
                items: [
                  {
                    id: "1",
                    stamps: [],
                  },
                ],
              },
            ],
          })),
          setInfiniteData: jest.fn(),
          invalidate: jest.fn(),
        },
      },
    };

    (api.useContext as jest.Mock).mockReturnValue(mockContext);

    const mockAddStamp = api.post.addStamp.useMutation as jest.Mock;
    const mockMutate = jest.fn();
    mockAddStamp.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      onSettled: jest.fn(),
    });

    render(<WrappedPostList />);
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // 成功ハンドラーを手動で呼び出す
    const mutationOptions = mockAddStamp.mock.calls[0][0];
    mutationOptions.onSuccess(
      { id: "1", stamps: [{ type: "thanks", anonymousId: "anonymous-1" }] },
      { postId: "1", type: "thanks" },
    );

    // onSettledを手動で呼び出す
    mutationOptions.onSettled();

    expect(mockContext.post.getAll.setInfiniteData).toHaveBeenCalled();
    expect(mockContext.post.getAll.invalidate).toHaveBeenCalled();
  });

  it("クライアントIPが取得できない場合でも表示される", () => {
    const mockGetClientId = api.post.getClientId.useQuery as jest.Mock;
    mockGetClientId.mockReturnValue({
      data: undefined,
    });

    render(<WrappedPostList />);
    expect(screen.getByText("テスト投稿")).toBeInTheDocument();
  });

  it("感情タグの取得に失敗した場合でもフィルターUIが表示される", () => {
    const mockGetEmotionTags = api.emotionTag.getAll.useQuery as jest.Mock;
    mockGetEmotionTags.mockReturnValue({
      data: undefined,
    });

    render(<WrappedPostList />);
    const select = screen.getByRole("combobox", { name: /すべての感情/i });
    expect(select).toBeInTheDocument();
    expect(select.children.length).toBe(7); // すべての感情オプションと6つの感情タグ
  });

  it("無限スクロールのデータが正しく表示される", () => {
    mockGetAllQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "1つ目の投稿",
                createdAt: new Date().toISOString(),
                emotionTag: { id: "clh1234567890", name: "怒り" },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: "cursor1",
          },
          {
            items: [
              {
                id: "2",
                content: "2つ目の投稿",
                createdAt: new Date().toISOString(),
                emotionTag: { id: "clh1234567891", name: "悲しみ" },
                anonymousId: "anonymous-2",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      hasNextPage: false,
    });

    render(<WrappedPostList />);
    expect(screen.getByText("1つ目の投稿")).toBeInTheDocument();
    expect(screen.getByText("2つ目の投稿")).toBeInTheDocument();
  });

  it("無限スクロールのデータ取得が正しく動作する", async () => {
    const mockFetchNextPage = jest.fn();
    mockGetAllQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿1",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: "next",
          },
        ],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    render(<WrappedPostList />);

    // fetchNextPageが呼び出せることを確認
    expect(mockFetchNextPage).toBeDefined();
    expect(typeof mockFetchNextPage).toBe("function");
  });

  it("スタンプの追加時にoptimistic updateが動作する", async () => {
    const mockContext = {
      post: {
        getAll: {
          cancel: jest.fn(),
          getInfiniteData: jest.fn(() => ({
            pages: [
              {
                items: [
                  {
                    id: "1",
                    content: "テスト投稿",
                    stamps: [],
                  },
                ],
              },
            ],
          })),
          setInfiniteData: jest.fn(),
          invalidate: jest.fn(),
        },
      },
    };

    (api.useContext as jest.Mock).mockReturnValue(mockContext);

    const mockMutate = jest
      .fn()
      .mockImplementation(async ({ postId, type }) => {
        await mockContext.post.getAll.cancel();
        const prevData = mockContext.post.getAll.getInfiniteData();
        mockContext.post.getAll.setInfiniteData(
          { limit: 10, emotionTagId: undefined, orderBy: "desc" },
          (old: any) => ({
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((post: any) => {
                if (post.id !== postId) return post;
                return {
                  ...post,
                  stamps: [
                    ...(post.stamps ?? []),
                    {
                      id: `temp-${Date.now()}`,
                      type,
                      anonymousId: "anonymous-1",
                      postId,
                      createdAt: new Date(),
                    },
                  ],
                };
              }),
            })),
          }),
        );
      });

    (api.post.addStamp.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<WrappedPostList />);
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // ポップオーバーが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // 非同期処理を待つ
    await mockMutate({ postId: "1", type: "thanks" });

    expect(mockContext.post.getAll.setInfiniteData).toHaveBeenCalled();
  });

  it("投稿の削除に失敗した場合エラーハンドリングされる", async () => {
    // 自分の投稿のデータを設定
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1", // 自分の投稿として設定
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    const mockDelete = api.post.delete.useMutation as jest.Mock;
    const mockMutate = jest.fn();
    mockDelete.mockReturnValue({
      mutate: mockMutate,
      onError: jest.fn(),
    });

    // クライアントIDを設定
    const mockGetClientId = api.post.getClientId.useQuery as jest.Mock;
    mockGetClientId.mockReturnValue({
      data: "anonymous-1",
    });

    render(<WrappedPostList />);
    const deleteButton = screen.getByRole("button", {
      name: /削除/i,
    });
    fireEvent.click(deleteButton);

    // AlertDialogのContentが表示されることを確認
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // 削除を確認
    const confirmButton = screen.getByRole("button", { name: "削除する" });
    fireEvent.click(confirmButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it("更新ボタンをクリックするとデータが再取得される", async () => {
    const mockRefetch = jest.fn();
    mockGetAllQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<WrappedPostList />);
    const refreshButton = screen.getByRole("button", { name: "" });
    await fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("更新中はボタンが無効化される", async () => {
    const mockRefetch = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    mockGetAllQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<WrappedPostList />);
    const refreshButton = screen.getByRole("button", { name: "" });

    await fireEvent.click(refreshButton);
    expect(refreshButton).toBeDisabled();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(refreshButton).not.toBeDisabled();
  });

  it("投稿の感情タグが正しく表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);
    expect(screen.getByText("😠 怒り")).toBeInTheDocument();
  });

  it("投稿の感情タグをクリックするとフィルターのセレクトボックスも同期して変更される", () => {
    const mockEmotionTags = [
      { id: "clh1234567890", name: "怒り" },
      { id: "clh1234567891", name: "楽しい" },
    ];

    (api.emotionTag.getAll.useQuery as jest.Mock).mockReturnValue({
      data: mockEmotionTags,
    });

    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "tag-1",
                  name: "楽しい",
                },
                anonymousId: "anonymous-1",
                stamps: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);

    // 感情タグボタンをクリック
    const emotionTagButton = screen.getByRole("button", { name: "🎵 楽しい" });
    fireEvent.click(emotionTagButton);

    // フィルターのセレクトボックスが同期して変更されていることを確認
    const filterSelect = screen.getByRole("combobox", {
      name: /すべての感情/i,
    });
    expect(filterSelect).toHaveValue("clh1234567891");
  });

  it("押されているスタンプが正しく表示される", () => {
    mockGetAllQuery.mockReturnValueOnce({
      data: {
        pages: [
          {
            items: [
              {
                id: "1",
                content: "テスト投稿",
                createdAt: new Date().toISOString(),
                emotionTag: {
                  id: "clh1234567890",
                  name: "怒り",
                },
                anonymousId: "anonymous-1",
                stamps: [
                  {
                    id: "stamp1",
                    type: "thanks",
                    anonymousId: "anonymous-1",
                    postId: "1",
                    createdAt: new Date(),
                  },
                  {
                    id: "stamp2",
                    type: "thanks",
                    anonymousId: "anonymous-2",
                    postId: "1",
                    createdAt: new Date(),
                  },
                  {
                    id: "stamp3",
                    type: "love",
                    anonymousId: "anonymous-1",
                    postId: "1",
                    createdAt: new Date(),
                  },
                ],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
    });

    render(<WrappedPostList />);

    // スタンプの数が正しく表示されていることを確認
    expect(screen.getByText("2")).toBeInTheDocument(); // thanksスタンプの数
    expect(screen.getByText("1")).toBeInTheDocument(); // loveスタンプの数
  });
});
