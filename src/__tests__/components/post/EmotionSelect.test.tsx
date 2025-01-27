import { render, screen, fireEvent } from "@testing-library/react";
import { EmotionSelect } from "~/components/post/EmotionSelect";
import { EMOTION_TAGS } from "~/constants/emotions";
import { renderWithProviders } from "~/utils/test-utils";

// テスト用の感情タグを定義
const mockEmotionTags = [
  {
    id: "1",
    name: "怒り",
    emoji: "😠",
  },
  {
    id: "2",
    name: "悲しみ",
    emoji: "😢",
  },
] as const;

// テストで使用する最初の感情タグを定数として定義
const firstEmotionTag = mockEmotionTags[0];

// モックの設定
jest.mock("~/utils/api", () => ({
  api: {
    emotionTag: {
      getAll: {
        useQuery: () => ({
          data: mockEmotionTags,
          isLoading: false,
          error: null,
        }),
      },
    },
  },
}));

describe("EmotionSelect", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("感情タグが正しくレンダリングされること", () => {
    renderWithProviders(
      <EmotionSelect selectedId="" onSelect={mockOnSelect} />,
    );

    expect(screen.getByText("感情を選択してください")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("感情タグを選択できること", () => {
    renderWithProviders(
      <EmotionSelect selectedId="" onSelect={mockOnSelect} />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    const option = screen.getByText(
      `${firstEmotionTag.emoji} ${firstEmotionTag.name}`,
    );
    fireEvent.click(option);

    expect(mockOnSelect).toHaveBeenCalledWith(firstEmotionTag.id);
  });

  it("disabled時に選択できないこと", () => {
    renderWithProviders(
      <EmotionSelect selectedId="" onSelect={mockOnSelect} disabled />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("選択された感情タグが表示されること", () => {
    renderWithProviders(
      <EmotionSelect selectedId={firstEmotionTag.id} onSelect={mockOnSelect} />,
    );

    expect(
      screen.getByText(`${firstEmotionTag.emoji} ${firstEmotionTag.name}`),
    ).toBeInTheDocument();
  });
});
