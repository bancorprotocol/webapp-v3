import {
  QueryClient,
  QueryClientProvider as QueryClientP,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 60000,
      staleTime: 30000,
      useErrorBoundary: true,
    },
  },
});

export const QueryClientProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientP client={queryClient}>{children}</QueryClientP>;
};
