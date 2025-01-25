import { render, screen } from "@testing-library/react";
import { SubmitButton } from "~/components/post/SubmitButton";

describe("SubmitButton", () => {
  it("通常状態で正しくレンダリングされること", () => {
    render(<SubmitButton isPending={false} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("投稿する");
    expect(button).not.toBeDisabled();
  });

  it("disabled状態で正しくレンダリングされること", () => {
    render(<SubmitButton isPending={false} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("投稿中の状態で正しくレンダリングされること", () => {
    render(<SubmitButton isPending={true} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("投稿中...");
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
