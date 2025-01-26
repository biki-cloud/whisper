import { render, screen, fireEvent } from "@testing-library/react";
import { EmotionSelect } from "~/components/post/EmotionSelect";
import { EMOTION_TAGS } from "~/constants/emotions";

describe("EmotionSelect", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("感情タグが正しくレンダリングされること", () => {
    render(<EmotionSelect selectedId="" onSelect={mockOnSelect} />);

    expect(screen.getByText("感情を選択してください")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("感情タグを選択できること", () => {
    render(<EmotionSelect selectedId="" onSelect={mockOnSelect} />);

    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    const option = screen.getByText(
      `${EMOTION_TAGS[0].emoji} ${EMOTION_TAGS[0].name}`,
    );
    fireEvent.click(option);

    expect(mockOnSelect).toHaveBeenCalledWith(EMOTION_TAGS[0].name);
  });

  it("disabled時に選択できないこと", () => {
    render(<EmotionSelect selectedId="" onSelect={mockOnSelect} disabled />);

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("選択された感情タグが表示されること", () => {
    render(
      <EmotionSelect
        selectedId={EMOTION_TAGS[0].name}
        onSelect={mockOnSelect}
      />,
    );

    expect(
      screen.getByText(`${EMOTION_TAGS[0].emoji} ${EMOTION_TAGS[0].name}`),
    ).toBeInTheDocument();
  });
});
