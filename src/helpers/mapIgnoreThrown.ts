export const mapIgnoreThrown = async <T, V>(
  input: readonly T[],
  iteratee: (value: T, index: number) => Promise<V>
): Promise<V[]> => {
  const IGNORE_TOKEN = 'IGNORE_TOKEN';
  const res = await Promise.all(
    input.map((val, index) => iteratee(val, index).catch(() => IGNORE_TOKEN))
  );
  return res.filter((res) => res !== IGNORE_TOKEN) as V[];
};
