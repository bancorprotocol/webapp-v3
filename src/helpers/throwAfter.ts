import wait from 'waait';

export const throwAfter = async (
  milliseconds: number,
  errorMessage?: string
): Promise<never> => {
  await wait(milliseconds);
  throw new Error(errorMessage || 'Timeout');
};
