import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "~/components/post/MessageInput";

describe("MessageInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("テキストエリアが正しくレンダリングされること", () => {
    render(<MessageInput content="" charCount={0} onChange={mockOnChange} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("0/100")).toBeInTheDocument();
  });

  it("テキストを入力できること", async () => {
    render(<MessageInput content="" charCount={0} onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "テストメッセージ");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("disabled時に入力できないこと", () => {
    render(
      <MessageInput
        content=""
        charCount={0}
        onChange={mockOnChange}
        disabled
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("文字数カウンターが正しく表示されること", () => {
    render(
      <MessageInput content="テスト" charCount={3} onChange={mockOnChange} />,
    );

    expect(screen.getByText("3/100")).toBeInTheDocument();
  });

  it("カスタムの最大文字数を設定できること", () => {
    render(
      <MessageInput
        content="テスト"
        charCount={3}
        maxLength={50}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("3/50")).toBeInTheDocument();
  });
});
