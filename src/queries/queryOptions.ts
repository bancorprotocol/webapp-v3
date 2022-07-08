export const queryOptionsNoInterval = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 0,
  staleTime: 6 * 60 * 60 * 1000,
});

export const queryOptionsStaleTimeLow = (enabled?: boolean) => ({
  enabled,
  refetchInterval: 5 * 60 * 1000,
  staleTime: 5 * 60 * 1000,
});
