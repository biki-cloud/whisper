import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "~/components/post/ErrorAlert";

describe("ErrorAlert", () => {
  it("エラーメッセージが表示されること", () => {
    render(<ErrorAlert message="テストエラー" />);
    expect(screen.getByText("テストエラー")).toBeInTheDocument();
  });

  it("メッセージがnullの場合、何も表示されないこと", () => {
    const { container } = render(<ErrorAlert message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("エラーアイコンが表示されること", () => {
    render(<ErrorAlert message="テストエラー" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
