import { render } from "@testing-library/react";
import VentLogo from "@/components/VentLogo";

describe("VentLogo", () => {
  it("デフォルトのサイズでレンダリングされる", () => {
    const { container } = render(<VentLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "200");
    expect(svg).toHaveAttribute("height", "100");
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

    // 波形のパス
    const wavePath = container.querySelector("path[stroke='url(#gradient)']");
    expect(wavePath).toBeInTheDocument();
    expect(wavePath).toHaveAttribute("stroke-width", "30");

    // Vの文字のパス
    const vPath = container.querySelector("path[stroke='#87CEEB']");
    expect(vPath).toBeInTheDocument();
    expect(vPath).toHaveAttribute("stroke-width", "12");

    // entの文字
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text).toHaveAttribute("fill", "#87CEEB");
    expect(text).toHaveTextContent("ent");
  });
});
