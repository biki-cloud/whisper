import { render, screen, fireEvent } from "@testing-library/react";
import { EmotionSelect } from "~/components/post/EmotionSelect";

const mockEmotionTags = [
  { id: "1", name: "😊 嬉しい" },
  { id: "2", name: "😢 悲しい" },
];

describe("EmotionSelect", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("感情タグが正しくレンダリングされること", () => {
    render(
      <EmotionSelect
        emotionTags={mockEmotionTags}
        selectedId=""
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("感情を選択してください")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("感情タグを選択できること", () => {
    render(
      <EmotionSelect
        emotionTags={mockEmotionTags}
        selectedId=""
        onSelect={mockOnSelect}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    const option = screen.getByText("😊 嬉しい");
    fireEvent.click(option);

    expect(mockOnSelect).toHaveBeenCalledWith("1");
  });

  it("disabled時に選択できないこと", () => {
    render(
      <EmotionSelect
        emotionTags={mockEmotionTags}
        selectedId=""
        onSelect={mockOnSelect}
        disabled
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("選択された感情タグが表示されること", () => {
    render(
      <EmotionSelect
        emotionTags={mockEmotionTags}
        selectedId="1"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("😊 嬉しい")).toBeInTheDocument();
  });
});
