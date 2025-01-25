import { render, screen, fireEvent } from "@testing-library/react";
import { PostList } from "~/components/post/PostList";
import { renderWithProviders } from "../utils/test-utils";
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

// emoji-martのモック
jest.mock("@emoji-mart/data", () => ({
  __esModule: true,
  default: {
    categories: [],
    emojis: {
      smile: {
        id: "smile",
        name: "Smiling Face",
        native: "😊",
        unified: "1f60a",
        keywords: ["happy", "joy", "pleased"],
        shortcodes: ":smile:",
      },
    },
  },
}));

jest.mock("@emoji-mart/react", () => {
  return {
    __esModule: true,
    default: ({ onEmojiSelect }: { onEmojiSelect: (emoji: any) => void }) => (
      <div data-testid="emoji-picker">
        <button
          onClick={() =>
            onEmojiSelect({
              id: "smile",
              name: "Smiling Face",
              native: "😊",
              unified: "1f60a",
              keywords: ["happy", "joy", "pleased"],
              shortcodes: ":smile:",
            })
          }
        >
          Select Emoji
        </button>
      </div>
    ),
  };
});

// framer-motionのモック
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, whileTap, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

// tRPCのモック
jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({
      post: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    })),
    emotionTag: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: [
            { id: "clh1234567890", name: "怒り" },
            { id: "clh1234567891", name: "楽しい" },
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
                    createdAt: "2025-01-25T14:18:43.000Z",
                    emotionTagId: "clh1234567890",
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
          hasNextPage: false,
          fetchNextPage: jest.fn(),
          isFetchingNextPage: false,
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

describe("PostList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("投稿一覧が表示される", () => {
    renderWithProviders(<PostList />);
    expect(screen.getByText("テスト投稿")).toBeInTheDocument();
  });

  it("感情タグでフィルタリングできる", () => {
    renderWithProviders(<PostList />);
    const select = screen.getByRole("combobox", { name: /すべての感情/i });
    fireEvent.change(select, { target: { value: "clh1234567890" } });
    expect(select).toHaveValue("clh1234567890");
  });

  it("投稿の並び順を変更できる", () => {
    renderWithProviders(<PostList />);
    const select = screen.getByRole("combobox", { name: /新しい順/i });
    fireEvent.change(select, { target: { value: "asc" } });
    expect(select).toHaveValue("asc");
  });

  it("自分の投稿を削除できる", () => {
    renderWithProviders(<PostList />);
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);
  });

  it("スタンプを追加できる", () => {
    const mockMutate = jest.fn();
    (api.post.addStamp.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    renderWithProviders(<PostList />);

    // スタンプを追加ボタンをクリック
    const addStampButton = screen.getByRole("button", {
      name: "+",
    });
    fireEvent.click(addStampButton);

    // 絵文字ピッカーが表示されることを確認
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();

    // 絵文字を選択
    fireEvent.click(screen.getByText("Select Emoji"));

    // スタンプが追加されたことを確認
    expect(mockMutate).toHaveBeenCalledWith({
      postId: "1",
      type: "😊",
      native: "😊",
    });
  });

  it("ローディング中にスピナーが表示される", () => {
    (api.post.getAll.useInfiniteQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    renderWithProviders(<PostList />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("投稿が0件の場合にメッセージが表示され、フィルターUIも表示される", () => {
    (api.post.getAll.useInfiniteQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    renderWithProviders(<PostList />);
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
});
