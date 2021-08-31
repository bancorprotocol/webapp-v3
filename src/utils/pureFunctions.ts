import BigNumber from 'bignumber.js';
import { Pool } from 'services/api/bancor';
import { Token } from 'services/observables/tokens';
import { EthNetworks } from 'services/web3/types';

export const oneMillion = new BigNumber(1000000);

export const ppmToDec = (ppm: string) => new BigNumber(ppm).div(oneMillion);

export const decToPpm = (dec: number | string): string =>
  new BigNumber(dec).times(oneMillion).toFixed(0);

export const shortenString = (
  string: string,
  separator = '...',
  toLength = 13
): string => {
  const startEndLength = Math.floor((toLength - separator.length) / 2);
  const start = string.substring(0, startEndLength);
  const end = string.substring(string.length - startEndLength, string.length);
  return start + separator + end;
};

export const classNameGenerator = (object: {
  [key: string]: unknown;
}): string => {
  return Object.entries(object)
    .filter(([k, v]) => k && v)
    .map((x) => x[0])
    .join(' ');
};

export const sanitizeNumberInput = (
  input: string | BigNumber,
  precision?: number
): string => {
  const sanitized = (typeof input === 'string' ? input : input.toString())
    .replace(/,/, '.')
    .replace(/[^\d.]/g, '')
    .replace(/\./, 'x')
    .replace(/\./g, '')
    .replace(/x/, '.');
  if (!precision) return sanitized;
  const [integer, decimals] = sanitized.split('.');
  return decimals
    ? `${integer}.${decimals.substring(0, precision)}`
    : sanitized;
};

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

export const updateArray = <T>(
  arr: T[],
  conditioner: (element: T) => boolean,
  updater: (element: T) => T
) => arr.map((element) => (conditioner(element) ? updater(element) : element));

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

export const splitArrayByVal = <T>(
  arr: T[],
  predicate: (value: T) => boolean
) => {
  return arr.reduce<[T[], T[]]>(
    (result, element) => {
      const res: T[] = result[predicate(element) ? 0 : 1];
      res.push(element);
      return result;
    },
    [[], []]
  );
};

export const partitionPair = <T>(
  arr: T[],
  predicate: (value: T) => boolean
): [T, T] => {
  if (arr.length !== 2) throw new Error(`Array must be length of 2`);
  if (arr.every(predicate))
    throw new Error('Both array elements passed truthy');
  return arr.slice().sort((a) => (predicate(a) ? -1 : 1)) as [T, T];
};

export interface ListPool {
  decApr?: number;
  id: string;
  reserves: {
    symbol: string;
    logoURI: string;
  }[];
}

export const createListPool = (
  pool: Pool,
  tokens: Token[],
  decApr?: number
): ListPool => ({
  id: pool.pool_dlt_id,
  ...(decApr && { decApr }),
  reserves: pool.reserves
    .map(
      (reserve) => tokens.find((token) => token.address === reserve.address)!
    )
    .sort((a) => (a.symbol === 'BNT' ? 1 : -1)),
});

export const wait = async (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
