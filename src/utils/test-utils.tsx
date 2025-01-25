import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "~/utils/api";
import { type PropsWithChildren } from "react";
import { EMOTION_TAGS } from "~/constants/emotions";

jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(),
    post: {
      getAll: {
        useQuery: jest.fn(),
      },
      addStamp: {
        useMutation: jest.fn(),
      },
      getClientId: {
        useQuery: jest.fn(),
      },
    },
    emotionTag: {
      getAll: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockEmotionTags = EMOTION_TAGS.map((tag, index) => ({
  id: String(index + 1),
  name: tag.name,
  emoji: tag.emoji,
}));

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

export * from "@testing-library/react";

// next/navigationのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
