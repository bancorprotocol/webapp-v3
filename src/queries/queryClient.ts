import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 60000,
      staleTime: 30000,
      useErrorBoundary: true,
    },
  },
});
