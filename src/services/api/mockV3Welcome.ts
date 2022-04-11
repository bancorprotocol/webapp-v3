import { APIPoolV3, APIToken } from 'services/api/bancor';
import { bntToken, ethToken } from 'services/web3/config';
import { TokenMinimal } from 'services/observables/tokens';
import imposterLogo from 'assets/logos/imposter.svg';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  getContractTestToken1LS,
  getContractTestToken2LS,
  getContractTestToken3LS,
  getContractTestToken4LS,
  getContractTestToken5LS,
} from 'utils/localStorage';

const allTestTokens = [
  {
    symbol: 'TKN1',
    address: getContractTestToken1LS(),
  },
  {
    symbol: 'TKN2',
    address: getContractTestToken2LS(),
  },
  {
    symbol: 'TKN3',
    address: getContractTestToken3LS(),
  },
  {
    symbol: 'TKN4',
    address: getContractTestToken4LS(),
  },
  {
    symbol: 'TKN5',
    address: getContractTestToken5LS(),
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

const buildAPIPoolV3 = async (
  address: string,
  symbol: string
): Promise<APIPoolV3> => {
  const poolToken_dlt_id = await ContractsApi.BancorNetworkInfo.read.poolToken(
    address
  );
  return {
    pool_dlt_id: address,
    poolToken_dlt_id,
    name: symbol,
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

export const getMockV3Pools = async (): Promise<APIPoolV3[]> => {
  const pools = await Promise.all(
    allTestTokens.map(
      async (token) => await buildAPIPoolV3(token.address, token.symbol)
    )
  );
  pools.push(await buildAPIPoolV3(ethToken, 'ETH'));
  pools.push(await buildAPIPoolV3(bntToken, 'BNT'));
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
