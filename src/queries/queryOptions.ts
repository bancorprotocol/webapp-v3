export const queryOptionsDefaults = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 30 * 1000,
  staleTime: 15 * 1000,
  useErrorBoundary: false,
});

export const queryOptionsNoInterval = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 0,
  staleTime: 6 * 60 * 60 * 1000,
});

export const queryOptionsStaleTime2m = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 2 * 60 * 1000,
  staleTime: 2 * 60 * 1000,
});

export const queryOptionsStaleTime15s = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 15 * 1000,
  staleTime: 15 * 1000,
});
