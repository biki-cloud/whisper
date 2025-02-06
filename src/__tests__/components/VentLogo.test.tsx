import { render } from "@testing-library/react";
import VentLogo from "@/components/VentLogo";

describe("VentLogo", () => {
  it("デフォルトのサイズでレンダリングされる", () => {
    const { container } = render(<VentLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("カスタムサイズでレンダリングされる", () => {
    const { container } = render(<VentLogo width={300} height={150} />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "300");
    expect(svg).toHaveAttribute("height", "150");
  });

  it("SVGの要素が正しく含まれている", () => {
    const { container } = render(<VentLogo />);

    // グラデーションの定義
    expect(container.querySelector("linearGradient")).toBeInTheDocument();

    // 背景の矩形
    const rect = container.querySelector("rect");
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute("fill", "url(#gradient)");

    // Vの文字のパス
    const vPath = container.querySelector("path");
    expect(vPath).toBeInTheDocument();
    expect(vPath).toHaveAttribute("fill", "white");
  });
});
