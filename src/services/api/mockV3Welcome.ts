import { APIPoolV3, APIToken } from 'services/api/bancor';
import { ethToken } from 'services/web3/config';

const allTestTokens = [
  {
    symbol: 'TKN1',
    address: '0xe288b25153D9B5F9aE874b347A4ba6aA8Ed77659',
    poolTokenAddress: '0x21C7d59D96E6Bf9c326AecB0290a437ED5D68655',
  },
  {
    symbol: 'TKN2',
    address: '0xf825FB8541E7ACDdB6E7A3F3c5C0D6245B1C74a3',
    poolTokenAddress: '0x0f981Ac6CD8876514Cf762483008d36fB8864104',
  },
  {
    symbol: 'TKN3',
    address: '0xCf7BB92c72925783DDB3dD830BE6546BC5820e6A',
    poolTokenAddress: '0xEB77C3a957e0b68a7c6a29bc2F10F0519eAe2f92',
  },
  {
    symbol: 'TKN4',
    address: '0x307cB15E4E51Ab87C52571a124683EEc9dE3c95D',
    poolTokenAddress: '0x6D66317F2667c6B056edaBAD26060FBEd20cBE85',
  },
  {
    symbol: 'TKN5',
    address: '0x475F095e6f663141E10cD29F39F54f4b8F270B16',
    poolTokenAddress: '0x991B3a7606f0c375E3d66aF335132fA146262F1D',
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

const buildAPIPoolV3 = (
  address: string,
  symbol: string,
  poolTokenAddress: string
): APIPoolV3 => {
  return {
    pool_dlt_id: address,
    poolToken_dlt_id: poolTokenAddress,
    name: `${symbol}/BNT`,
    liquidity: { usd: '123' },
    volume_24h: { usd: '123' },
    fees_24h: { usd: '123' },
    fee: '123',
    version: 99,
    supply: '1123',
    decimals: 18,
    isWhitelisted: true,
  };
};

export const getMockV3Tokens = (): APIToken[] => {
  return allTestTokens.map((token) =>
    buildAPIToken(token.address, token.symbol)
  );
};

export const getMockV3Pools = (): APIPoolV3[] => {
  const pools = allTestTokens.map((token) =>
    buildAPIPoolV3(token.address, token.symbol, token.poolTokenAddress)
  );
  pools.push(
    buildAPIPoolV3(
      ethToken,
      'ETH',
      '0xa9FdEf68d93357b9E059E51D3Bee4D351417B463'
    )
  );
  return pools;
};
