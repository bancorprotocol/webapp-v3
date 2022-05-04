import { allTokensNew$, Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { apiPools$, apiPoolsV3$ } from 'services/observables/apiData';
import { bntToken, ethToken, getNetworkVariables } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { shrinkToken } from 'utils/formulas';
import { fetchETH } from 'services/web3/token/token';
import {
  APIPool,
  APIPoolV3,
  APIReward,
} from 'services/api/bancorApi/bancorApi.types';

export interface Reserve {
  address: string;
  weight: string;
  balance: string;
  symbol: string;
  logoURI: string;
  rewardApr?: number;
  decimals: number;
  usdPrice: number | string | null;
}

export interface Pool {
  name: string;
  pool_dlt_id: string;
  converter_dlt_id: string;
  reserves: Reserve[];
  liquidity: number;
  volume_24h: number;
  fees_24h: number;
  fee: number;
  version: number;
  supply: number;
  decimals: number;
  apr: number;
  reward?: APIReward;
  isProtected: boolean;
}

export interface PoolV3 extends APIPoolV3 {
  reserveToken: Token;
  fundingLimit: string;
  tknVaultBalance: string;
  depositLimit: string;
  depositingEnabled: boolean;
  tradingEnabled: boolean;
  apr: number;
}

export interface PoolToken {
  bnt: {
    token: Reserve;
    amount: string;
  };
  tkn: {
    token: Reserve;
    amount: string;
  };
  amount: string;
  value: string;
  poolDecimals: number;
  converter: string;
  poolName: string;
  version: number;
}

export const buildPoolObject = (
  apiPool: APIPool,
  tkn: Token,
  bnt: Token
): Pool | undefined => {
  const liquidity = Number(apiPool.liquidity.usd ?? 0);
  const fees_24h = Number(apiPool.fees_24h.usd ?? 0);
  let apr = 0;
  if (liquidity && fees_24h) {
    apr = new BigNumber(fees_24h)
      .times(365)
      .div(liquidity)
      .times(100)
      .toNumber();
  }

  const reserveTkn = apiPool.reserves.find((r) => r.address === tkn.address);
  if (!reserveTkn) {
    return undefined;
  }
  const reserveBnt = apiPool.reserves.find((r) => r.address === bnt.address);
  if (!reserveBnt) {
    return undefined;
  }

  const reserves: Reserve[] = [
    {
      ...reserveTkn,
      rewardApr: Number(reserveTkn.apr) / 10000,
      symbol: tkn.symbol,
      logoURI: tkn.logoURI,
      decimals: tkn.decimals,
      usdPrice: tkn.usdPrice,
    },
    {
      ...reserveBnt,
      rewardApr: Number(reserveBnt.apr) / 10000,
      symbol: bnt.symbol,
      logoURI: bnt.logoURI,
      decimals: bnt.decimals,
      usdPrice: bnt.usdPrice,
    },
  ];

  const isProtected = tkn.isProtected;

  return {
    name: apiPool.name,
    pool_dlt_id: apiPool.pool_dlt_id,
    converter_dlt_id: apiPool.converter_dlt_id,
    reserves,
    liquidity,
    volume_24h: Number(apiPool.volume_24h.usd ?? 0),
    fees_24h,
    fee: Number(apiPool.fee) / 10000,
    version: apiPool.version,
    supply: Number(apiPool.supply),
    decimals: apiPool.decimals,
    apr,
    reward: apiPool.reward,
    isProtected,
  };
};

export const poolsNew$ = combineLatest([apiPools$, allTokensNew$]).pipe(
  switchMapIgnoreThrow(async ([apiPools, allTokens]) => {
    const bnt = allTokens.find((t) => t.address === bntToken);
    if (!bnt) {
      return [];
    }
    return allTokens
      .map((tkn) => {
        if (tkn.address === bntToken) {
          return undefined;
        }
        const apiPool = apiPools.find((pool) => {
          return pool.reserves.find((reserve) => {
            return reserve.address === tkn.address;
          });
        });
        if (!apiPool) {
          return undefined;
        }
        return buildPoolObject(apiPool, tkn, bnt);
      })
      .filter((pool) => !!pool) as Pool[];
  }),
  distinctUntilChanged<Pool[]>(isEqual),
  shareReplay(1)
);

export const poolsV3$ = combineLatest([apiPoolsV3$, allTokensNew$]).pipe(
  switchMapIgnoreThrow(async ([apiPoolsV3, allTokens]) => {
    const apiPoolsMap = new Map(apiPoolsV3.map((p) => [p.poolDltId, p]));
    const allTokensMap = new Map(allTokens.map((t) => [t.address, t]));
    const masterVault = await ContractsApi.BancorNetworkInfo.read.masterVault();
    const poolsV3 = await Promise.all(
      allTokens.map(async (tkn) => {
        const apiPool = apiPoolsMap.get(tkn.address);
        const reserveToken = allTokensMap.get(tkn.address);
        if (!apiPool || !reserveToken) {
          return undefined;
        }
        const fundingLimit =
          await ContractsApi.NetworkSettings.read.poolFundingLimit(
            apiPool.poolDltId
          );

        const poolLiquidity =
          await ContractsApi.PoolCollection.read.poolLiquidity(
            apiPool.poolDltId
          );

        const data = await ContractsApi.PoolCollection.read.poolData(
          apiPool.poolDltId
        );

        const isBnt = apiPool.poolDltId === getNetworkVariables().bntToken;

        const tknVaultBalance =
          apiPool.poolDltId !== ethToken
            ? await ContractsApi.Token(apiPool.poolDltId).read.balanceOf(
                masterVault
              )
            : await fetchETH(masterVault);

        let apr = new BigNumber(apiPool.fees24h.usd)
          .times(365)
          .div(apiPool.tradingLiquidityTKN.usd)
          .times(100)
          .toNumber();

        const pool: PoolV3 = {
          ...apiPool,
          apr,
          reserveToken,
          fundingLimit: shrinkToken(fundingLimit.toString(), apiPool.decimals),
          tknVaultBalance: shrinkToken(
            tknVaultBalance.toString(),
            apiPool.decimals
          ),
          depositLimit: shrinkToken(
            data.depositLimit.toString(),
            apiPool.decimals
          ),
          depositingEnabled: data.depositingEnabled || isBnt,
          tradingEnabled: data.tradingEnabled || isBnt,
        };
        return pool;
      })
    );

    return poolsV3.filter((pool) => !!pool) as PoolV3[];
  }),
  distinctUntilChanged<PoolV3[]>(isEqual),
  shareReplay(1)
);
