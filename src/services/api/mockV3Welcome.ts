import { APIPoolV3, APIToken } from 'services/api/bancor';
import { bntToken, ethToken } from 'services/web3/config';
import { TokenMinimal } from 'services/observables/tokens';
import imposterLogo from 'assets/logos/imposter.svg';
import { ContractsApi } from 'services/web3/v3/contractsApi';

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
    apr: 123,
  };
};

export const getMockV3Pools = async (): Promise<APIPoolV3[]> => {
  const pools = [];
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
