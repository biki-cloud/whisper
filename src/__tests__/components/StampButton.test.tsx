import { render, screen, fireEvent } from "@testing-library/react";
import { StampButton } from "~/components/StampButton";

const mockStamps = [
  {
    id: "1",
    type: "happy",
    anonymousId: "user1",
    postId: "post1",
    createdAt: new Date(),
    native: "😊",
  },
  {
    id: "2",
    type: "happy",
    anonymousId: "user2",
    postId: "post1",
    createdAt: new Date(),
    native: "😊",
  },
];

describe("StampButton", () => {
  const mockOnStampClick = jest.fn();

  beforeEach(() => {
    mockOnStampClick.mockClear();
  });

  it("正しくレンダリングされること", () => {
    render(
      <StampButton
        type="happy"
        postId="post1"
        stamps={mockStamps}
        clientId="user1"
        onStampClick={mockOnStampClick}
      />,
    );

    const button = screen.getByTestId("stamp-button");
    const emoji = screen.getByTestId("stamp-emoji");
    const count = screen.getByTestId("stamp-count");

    expect(button).toBeInTheDocument();
    expect(emoji).toHaveTextContent("😊");
    expect(count).toHaveTextContent("2");
  });

  it("アクティブな状態が正しく表示されること", () => {
    render(
      <StampButton
        type="happy"
        postId="post1"
        stamps={mockStamps}
        clientId="user1"
        onStampClick={mockOnStampClick}
      />,
    );

    const button = screen.getByTestId("stamp-button");
    expect(button).toHaveClass("bg-blue-100");
  });

  it("非アクティブな状態が正しく表示されること", () => {
    render(
      <StampButton
        type="happy"
        postId="post1"
        stamps={mockStamps}
        clientId="user3"
        onStampClick={mockOnStampClick}
      />,
    );

    const button = screen.getByTestId("stamp-button");
    expect(button).toHaveClass("bg-gray-100");
  });

  it("クリック時にonStampClickが呼ばれること", () => {
    render(
      <StampButton
        type="happy"
        postId="post1"
        stamps={mockStamps}
        clientId="user1"
        onStampClick={mockOnStampClick}
      />,
    );

    const button = screen.getByTestId("stamp-button");
    fireEvent.click(button);

    expect(mockOnStampClick).toHaveBeenCalledWith("post1", "happy");
  });

  it("カウントを非表示にできること", () => {
    render(
      <StampButton
        type="happy"
        postId="post1"
        stamps={mockStamps}
        clientId="user1"
        onStampClick={mockOnStampClick}
        showCount={false}
      />,
    );

    const count = screen.queryByTestId("stamp-count");
    expect(count).not.toBeInTheDocument();
  });
});
