import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { api } from "~/utils/api";
import { type PropsWithChildren } from "react";
import { EMOTION_TAGS } from "~/constants/emotions";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "~/server/api/root";

const mockTrpc = createTRPCReact<AppRouter>();

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
        useQuery: jest.fn().mockReturnValue({
          data: EMOTION_TAGS.map((tag, index) => ({
            id: String(index + 1),
            name: tag.name,
            emoji: tag.emoji,
          })),
          isLoading: false,
          error: null,
        }),
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

const trpcClient = mockTrpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: {
        input: <T,>(data: T) => data,
        output: <T,>(data: T) => data,
      },
    }),
  ],
});

const mockEmotionTags = EMOTION_TAGS.map((tag, index) => ({
  id: String(index + 1),
  name: tag.name,
  emoji: tag.emoji,
}));

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <mockTrpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </mockTrpc.Provider>,
  );
}

export function withTRPC<T extends React.ComponentType<any>>(Component: T): T {
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return (
      <mockTrpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Component {...props} />
        </QueryClientProvider>
      </mockTrpc.Provider>
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
