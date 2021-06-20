export const findOrThrow = <T>(
  arr: readonly T[],
  iteratee: (obj: T, index: number, arr: readonly T[]) => unknown,
  message?: string
) => {
  const res = arr.find(iteratee);
  if (!res)
    throw new Error(message || 'Failed to find object in find or throw');
  return res;
};
