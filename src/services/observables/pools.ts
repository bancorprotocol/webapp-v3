import { allTokensNew$, Token, tokensV3$ } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { apiPools$, apiPoolsV3$ } from 'services/observables/apiData';
import { bntToken } from 'services/web3/config';
import {
  APIPool,
  APIPoolV3,
  APIReward,
} from 'services/api/bancorApi/bancorApi.types';
import { toBigNumber } from 'utils/helperFunctions';
import { calcApr, shrinkToken } from 'utils/formulas';
import { standardRewardPrograms$ } from 'services/observables/standardRewards';
import {
  fetchLatestProgramIdsMulticall,
  RewardsProgramRaw,
} from 'services/web3/v3/portfolio/standardStaking';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

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
  apr: {
    tradingFees: number;
    standardRewards: number;
    autoCompounding: number;
    total: number;
  };
  programs: RewardsProgramRaw[];
  latestProgram?: RewardsProgramRaw;
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

const buildPoolV3Object = async (
  apiPool?: APIPoolV3,
  reserveToken?: Token,
  latestProgramIdMap?: Map<string, string | undefined>,
  rewardsPrograms?: RewardsProgramRaw[]
): Promise<PoolV3 | undefined> => {
  if (!apiPool || !reserveToken) {
    return undefined;
  }

  // ALL programs of this pool
  const programs = rewardsPrograms?.filter((p) => p.pool === apiPool.poolDltId);

  // The latest program
  const latestProgram = programs?.find(
    (p) => p.id === latestProgramIdMap?.get(apiPool.poolDltId)
  );

  // Calculate APR
  let standardRewardsApr = 0;
  if (programs && programs.length) {
    standardRewardsApr = programs
      // Only use APR from active programs
      .filter((p) => p.isActive)
      .reduce((acc, data) => {
        // TODO - currently assuming reward token to be BNT
        const rewardRate = shrinkToken(data.rewardRate ?? 0, 18);
        const rewardRate24h = toBigNumber(rewardRate)
          .times(60 * 60)
          .times(24);
        return acc + calcApr(rewardRate24h, apiPool.standardRewardsStaked.bnt);
      }, 0);
  }

  const tradingFeesApr = calcApr(
    apiPool.fees24h.usd,
    apiPool.stakedBalance.usd
  );

  // TODO - add values once available
  const autoCompoundingApr = 0;

  const totalApr = toBigNumber(tradingFeesApr)
    .plus(standardRewardsApr)
    .toNumber();

  return {
    ...apiPool,
    apr: {
      tradingFees: tradingFeesApr,
      standardRewards: standardRewardsApr,
      autoCompounding: autoCompoundingApr,
      total: totalApr,
    },
    reserveToken,
    programs: programs ?? [],
    latestProgram,
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

export const poolsV3$ = combineLatest([
  apiPoolsV3$,
  tokensV3$,
  standardRewardPrograms$,
]).pipe(
  switchMapIgnoreThrow(
    async ([apiPoolsV3, allTokens, standardRewardPrograms]) => {
      const tokensMap = new Map(allTokens.map((t) => [t.address, t]));

      const latestProgramIds = await fetchLatestProgramIdsMulticall(apiPoolsV3);

      const pools = await Promise.all(
        apiPoolsV3.map(
          async (pool) =>
            await buildPoolV3Object(
              pool,
              tokensMap.get(pool.poolDltId),
              latestProgramIds,
              standardRewardPrograms
            )
        )
      );
      return pools.filter((pool) => !!pool) as PoolV3[];
    }
  ),
  distinctUntilChanged<PoolV3[]>(isEqual),
  shareReplay(1)
);
