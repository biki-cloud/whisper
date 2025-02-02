import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "~/server/api/root";
import superjson from "superjson";
import { type PropsWithChildren } from "react";
import { type EmotionTag } from "@prisma/client";
import { Toaster } from "~/components/ui/toaster";

const mockTrpc = createTRPCReact<AppRouter>();

const mockTrpcClient = mockTrpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: {
        input: {
          serialize: (obj: unknown) => obj,
          deserialize: (obj: unknown) => obj,
        },
        output: {
          serialize: (obj: unknown) => obj,
          deserialize: (obj: unknown) => obj,
        },
      },
    }),
  ],
});

export const mockEmotionTags: EmotionTag[] = [
  {
    id: "1",
    name: "happy",
  },
  {
    id: "2",
    name: "sad",
  },
];

export const mockTrpcQueries = {
  emotionTag: {
    list: {
      useQuery: () => ({
        data: mockEmotionTags,
        isLoading: false,
        error: null,
      }),
    },
  },
  post: {
    create: {
      useMutation: () => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      }),
    },
    list: {
      useInfiniteQuery: () => ({
        data: {
          pages: [],
          pageParams: [],
        },
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        error: null,
      }),
    },
    delete: {
      useMutation: () => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      }),
    },
    getClientId: {
      useQuery: () => ({
        data: "test-client-id",
        isLoading: false,
        error: null,
      }),
    },
    getAllPosts: {
      useQuery: () => ({
        data: [],
        isLoading: false,
        error: null,
      }),
    },
  },
  stamp: {
    toggle: {
      useMutation: () => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      }),
    },
  },
  notification: {
    savePushSubscription: {
      useMutation: () => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      }),
    },
    sendTestNotification: {
      useMutation: () => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      }),
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <mockTrpc.Provider client={mockTrpcClient} queryClient={queryClient}>
        <>
          {ui}
          <Toaster />
        </>
      </mockTrpc.Provider>
    </QueryClientProvider>,
  );
}

export function withTRPC<P extends PropsWithChildren<object>>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <QueryClientProvider client={queryClient}>
        <mockTrpc.Provider client={mockTrpcClient} queryClient={queryClient}>
          <>
            <Component {...props} />
            <Toaster />
          </>
        </mockTrpc.Provider>
      </QueryClientProvider>
    );
  };
}

// next/navigationのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

export * from "@testing-library/react";
