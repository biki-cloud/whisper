import { render, screen, fireEvent } from "@testing-library/react";
import { StampPicker } from "@/components/StampPicker";

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

describe("StampPicker", () => {
  it("renders the picker button", () => {
    const onSelect = jest.fn();
    render(<StampPicker onSelect={onSelect} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens the picker when clicked", () => {
    const onSelect = jest.fn();
    render(<StampPicker onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("calls onSelect when an emoji is selected", () => {
    const onSelect = jest.fn();
    render(<StampPicker onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Select Emoji"));

    expect(onSelect).toHaveBeenCalledWith({
      type: "smile",
      native: "😊",
    });
  });

  it("disables the button when disabled prop is true", () => {
    const onSelect = jest.fn();
    render(<StampPicker onSelect={onSelect} disabled={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
