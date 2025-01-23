import { render, screen, fireEvent } from "@testing-library/react";
import { PostList } from "~/components/PostList";
import { withTRPC } from "../utils/test-utils";
import { api } from "~/utils/api";

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
                    ipAddress: "127.0.0.1",
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
      getClientIp: {
        useQuery: jest.fn(() => ({
          data: "127.0.0.1",
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
    const thanksButton = screen.getByRole("button", {
      name: "ありがとうボタン",
    });
    fireEvent.click(thanksButton);

    const empathyButton = screen.getByRole("button", { name: "共感ボタン" });
    fireEvent.click(empathyButton);
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
                ipAddress: "127.0.0.1",
                stamps: [
                  { type: "thanks", ipAddress: "127.0.0.1" },
                  { type: "empathy", ipAddress: "127.0.0.1" },
                  { type: "thanks", ipAddress: "127.0.0.2" },
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
    const thanksCount = screen.getByText("2");
    const empathyCount = screen.getByText("1");
    expect(thanksCount).toBeInTheDocument();
    expect(empathyCount).toBeInTheDocument();
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
    const thanksButton = screen.getByRole("button", {
      name: "ありがとうボタン",
    });
    const empathyButton = screen.getByRole("button", { name: "共感ボタン" });

    expect(thanksButton).toBeDisabled();
    expect(empathyButton).toBeDisabled();
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
                ipAddress: "127.0.0.1",
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
    expect(screen.getByText("15:30")).toBeInTheDocument();
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
                ipAddress: "127.0.0.1",
                stamps: [
                  { type: "thanks", ipAddress: "127.0.0.1" },
                  { type: "empathy", ipAddress: "127.0.0.1" },
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
    const thanksButton = screen.getByRole("button", {
      name: "ありがとうボタン",
    });
    const empathyButton = screen.getByRole("button", { name: "共感ボタン" });

    expect(thanksButton).toHaveClass("bg-blue-500", "text-white");
    expect(empathyButton).toHaveClass("bg-blue-500", "text-white");
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
                ipAddress: "192.168.1.1", // 異なるIPアドレス
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
                ipAddress: "192.168.1.1", // 異なるIPアドレス
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
});
