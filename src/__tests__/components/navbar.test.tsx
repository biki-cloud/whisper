import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/Navbar";

jest.mock("next/navigation", () => {
  return {
    usePathname: jest.fn(),
  };
});

const usePathname = jest.requireMock("next/navigation").usePathname;

describe("Navbar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("ナビゲーションリンクが正しくレンダリングされること", () => {
    render(<Navbar />);

    expect(screen.getByText("投稿一覧")).toBeInTheDocument();
    expect(screen.getByText("新規投稿")).toBeInTheDocument();
    expect(screen.getByText("アカウント")).toBeInTheDocument();
  });

  it("アクティブなリンクが正しく強調表示されること", () => {
    usePathname.mockReturnValue("/posts");
    render(<Navbar />);

    const postsLink = screen.getByText("投稿一覧").closest("a");
    expect(postsLink).toHaveClass("text-primary");

    const newPostLink = screen.getByText("新規投稿").closest("a");
    expect(newPostLink).toHaveClass("text-muted-foreground");
  });
});
