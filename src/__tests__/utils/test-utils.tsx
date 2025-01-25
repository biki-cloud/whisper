import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
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

export function withTRPC<T extends React.ComponentType<any>>(Component: T): T {
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  } as T;
}

export { api };

// next/navigationのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

export * from "@testing-library/react";
