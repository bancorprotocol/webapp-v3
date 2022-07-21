import {
  QueryClient,
  QueryClientProvider as QueryClientP,
  QueryClientConfig,
} from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryOptionsDefaults } from 'queries/queryOptions';

const config: QueryClientConfig = {
  defaultOptions: {
    queries: queryOptionsDefaults(),
  },
};

const queryClient = new QueryClient(config);

export const QueryClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientP client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientP>
  );
};
