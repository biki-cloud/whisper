import { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { api } from "~/utils/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function withTRPC(Component: React.ComponentType) {
  return function WrappedComponent(props: any) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(withTRPC(() => ui)({}));
}
