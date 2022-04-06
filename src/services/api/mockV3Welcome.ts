import { APIPoolV3, APIToken } from 'services/api/bancor';
import { bntToken, ethToken } from 'services/web3/config';
import { TokenMinimal } from 'services/observables/tokens';
import imposterLogo from 'assets/logos/imposter.svg';

const allTestTokens = [
  {
    symbol: 'TKN1',
    address: '0x5fAeD2F6a99fae28D94833f521b43e9114Ec3B74',
    poolTokenAddress: '0xC3479a27977225325D0F0f3d2816d7868CB4a9dA',
  },
  {
    symbol: 'TKN2',
    address: '0x30Bc1f2D0404f12683D0100325F536Caeb784548',
    poolTokenAddress: '0x860D80C071feB128EACC8881d06644BC4d828583',
  },
  {
    symbol: 'TKN3',
    address: '0x5E08991d5a90e98059d16ab48e2d5DE0Bb79f21f',
    poolTokenAddress: '0x66e5FC1298Da3d8ee5622E192D36b03EbB7EEB1a',
  },
  {
    symbol: 'TKN4',
    address: '0x3a8f010268BEc61B7714B1dFD1887979D5C7A15c',
    poolTokenAddress: '0x300C161f4CFa354f113d8eE80bC3642d47216848',
  },
  {
    symbol: 'TKN5',
    address: '0xC5856985cDe9FeB8151ecA27cAAD2aB6D58e881B',
    poolTokenAddress: '0xb6CD5C7875Ae0BFd20f8e787D94A12e34fa9d1E6',
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
  pools.push(
    buildAPIPoolV3(
      bntToken,
      'BNT',
      '0x3e568EAd153A14D2f8834576aE569ce1DE82fe72'
    )
  );
  return pools;
};

export const getTokenListMock = (): TokenMinimal[] => {
  return allTestTokens.map(({ address, symbol }) => ({
    symbol,
    address,
    decimals: 18,
    logoURI: imposterLogo,
  }));
};
