import { APIToken } from 'services/api/bancor';

const allTestTokens = [
  {
    symbol: 'TKN1',
    address: '0xe288b25153D9B5F9aE874b347A4ba6aA8Ed77659',
  },
  {
    symbol: 'TKN2',
    address: '0xf825FB8541E7ACDdB6E7A3F3c5C0D6245B1C74a3',
  },
  {
    symbol: 'TKN3',
    address: '0xCf7BB92c72925783DDB3dD830BE6546BC5820e6A',
  },
  {
    symbol: 'TKN4',
    address: '0x307cB15E4E51Ab87C52571a124683EEc9dE3c95D',
  },
  {
    symbol: 'TKN5',
    address: '0x475F095e6f663141E10cD29F39F54f4b8F270B16',
  },
];

const buildAPIToken = (address: string, symbol: string): APIToken => {
  return {
    symbol,
    dlt_id: address,
    liquidity: { usd: '123' },
    rate: { usd: '123' },
    rate_24h_ago: { usd: '123' },
    decimals: 18,
    rates_7d: [],
  };
};

export const getMockV3Tokens = (): APIToken[] => {
  return allTestTokens.map((token) =>
    buildAPIToken(token.address, token.symbol)
  );
};
