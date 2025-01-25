import { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { api } from "~/utils/api";
import { EMOTION_TAGS } from "~/constants/emotions";

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
  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
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
    post: {
      create: {
        useMutation: (options: any) => ({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          ...options,
        }),
      },
    },
    useContext: () => ({
      post: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    }),
  },
}));

// next/navigationのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
