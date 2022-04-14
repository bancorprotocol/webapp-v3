import { APIPoolV3, APIToken } from 'services/api/bancor';
import { bntToken, ethToken } from 'services/web3/config';
import { TokenMinimal } from 'services/observables/tokens';
import imposterLogo from 'assets/logos/imposter.svg';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { getBancorV3Contracts } from 'utils/localStorage';
import { address as testToken1Address } from 'services/web3/abis/v3/TestToken1.json';
import { address as testToken2Address } from 'services/web3/abis/v3/TestToken2.json';
import { address as testToken3Address } from 'services/web3/abis/v3/TestToken3.json';
import { address as testToken4Address } from 'services/web3/abis/v3/TestToken4.json';
import { address as testToken5Address } from 'services/web3/abis/v3/TestToken5.json';
import { address as testToken6Address } from 'services/web3/abis/v3/TestToken6.json';
import { address as testToken7Address } from 'services/web3/abis/v3/TestToken7.json';

const allTestTokens = [
  {
    symbol: 'TKN1',
    address: getBancorV3Contracts()?.testToken1 || testToken1Address,
    decimals: 18,
  },
  {
    symbol: 'TKN2',
    address: getBancorV3Contracts()?.testToken2 || testToken2Address,
    decimals: 18,
  },
  {
    symbol: 'TKN3',
    address: getBancorV3Contracts()?.testToken3 || testToken3Address,
    decimals: 18,
  },
  {
    symbol: 'TKN4',
    address: getBancorV3Contracts()?.testToken4 || testToken4Address,
    decimals: 18,
  },
  {
    symbol: 'TKN5',
    address: getBancorV3Contracts()?.testToken5 || testToken5Address,
    decimals: 18,
  },
  {
    symbol: 'TKN6',
    address: getBancorV3Contracts()?.testToken6 || testToken6Address,
    decimals: 4,
  },
  {
    symbol: 'TKN7',
    address: getBancorV3Contracts()?.testToken7 || testToken7Address,
    decimals: 18,
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
  symbol: string,
  decimals: number
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
    decimals,
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
      async (token) =>
        await buildAPIPoolV3(token.address, token.symbol, token.decimals)
    )
  );
  pools.push(await buildAPIPoolV3(ethToken, 'ETH', 18));
  pools.push(await buildAPIPoolV3(bntToken, 'BNT', 18));
  pools.push(
    await buildAPIPoolV3(
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      'DAI',
      18
    )
  );
  pools.push(
    await buildAPIPoolV3(
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      'LINK',
      18
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
