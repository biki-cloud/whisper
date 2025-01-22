import { render, screen, fireEvent } from "@testing-library/react";
import { PostList } from "~/components/PostList";
import { api } from "~/utils/api";
import { withTRPC } from "../utils/test-utils";

// tRPCのモック
jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({})),
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
});
