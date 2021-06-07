import { EthNetworks } from 'web3/types';

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

export const sanitizeNumberInput = (input: string): string => {
  return input
    .replace(/[^\d.]/g, '')
    .replace(/\./, 'x')
    .replace(/\./g, '')
    .replace(/x/, '.');
};

export const getNetworkName = (network: EthNetworks): string => {
  switch (network) {
    case EthNetworks.Mainnet:
      return 'Ethereum Mainnet';
    case EthNetworks.Ropsten:
      return 'Ropsten Test Network';
    default:
      return 'Unsupported network';
  }
};

export const isUnsupportedNetwork = (
  network: EthNetworks | undefined
): boolean => {
  return network !== undefined && EthNetworks[network] === undefined;
};

const autoLogin: string = 'autoLogin';

export const setAutoLogin = (flag: boolean) => {
  if (flag) localStorage.setItem(autoLogin, 'true');
  else localStorage.removeItem(autoLogin);
};

export const isAutoLogin = (): boolean => {
  return localStorage.getItem(autoLogin) === 'true';
};
