import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StampSelector } from "~/components/post/StampSelector";
import { usePostStamps } from "~/hooks/post/usePostStamps";

jest.mock("~/hooks/post/usePostStamps");

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
        skins: [],
        version: 1,
      },
    },
  },
}));

jest.mock("@emoji-mart/react", () => {
  return {
    __esModule: true,
    default: ({
      onEmojiSelect,
    }: {
      onEmojiSelect: (emoji: { id: string; native: string }) => void;
    }) => (
      <div data-testid="emoji-picker">
        <button
          onClick={() =>
            onEmojiSelect({
              id: "smile",
              native: "😊",
            })
          }
        >
          Select Emoji
        </button>
      </div>
    ),
  };
});

describe("StampSelector", () => {
  const mockStamps = [
    {
      id: "1",
      type: "happy",
      native: "😊",
      anonymousId: "user1",
      postId: "post1",
      createdAt: new Date(),
    },
    {
      id: "2",
      type: "happy",
      native: "😊",
      anonymousId: "user2",
      postId: "post1",
      createdAt: new Date(),
    },
  ];

  const mockHandleStampClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostStamps as jest.Mock).mockReturnValue({
      clientId: "test-client-id",
      handleStampClick: mockHandleStampClick,
    });
  });

  it("スタンプセレクターが正しくレンダリングされること", () => {
    render(<StampSelector postId="post1" stamps={mockStamps} />);
    expect(screen.getByTestId("stamp-selector")).toBeInTheDocument();
  });

  it("clientIdがない場合、StampPickerが無効化されること", () => {
    (usePostStamps as jest.Mock).mockReturnValue({
      clientId: undefined,
      handleStampClick: mockHandleStampClick,
    });

    render(<StampSelector postId="post1" stamps={mockStamps} />);
    const addButton = screen.getByRole("button", { name: "+" });
    expect(addButton).toBeDisabled();
  });

  it("スタンプがグループ化されて表示されること", () => {
    render(<StampSelector postId="post1" stamps={mockStamps} />);
    const stampButton = screen.getByTestId("stamp-button");
    const stampCount = screen.getByTestId("stamp-count");
    expect(stampButton).toBeInTheDocument();
    expect(stampCount).toHaveTextContent("2");
  });

  it("スタンプクリック時にhandleStampClickが呼ばれること", async () => {
    const user = userEvent.setup();
    render(<StampSelector postId="post1" stamps={mockStamps} />);

    const stampButton = screen.getByTestId("stamp-button");
    await user.click(stampButton);

    expect(mockHandleStampClick).toHaveBeenCalledWith("post1", "happy");
  });

  it("StampPickerで絵文字を選択した時にhandleStampClickが呼ばれること", async () => {
    const user = userEvent.setup();
    render(<StampSelector postId="post1" stamps={mockStamps} />);

    const addButton = screen.getByRole("button", { name: "+" });
    await user.click(addButton);

    const selectEmojiButton = screen.getByText("Select Emoji");
    await user.click(selectEmojiButton);

    expect(mockHandleStampClick).toHaveBeenCalledWith("post1", "😊", "😊");
  });
});
