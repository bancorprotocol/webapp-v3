import { allTokensNew$, Token, tokensV3$ } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { apiPools$, apiPoolsV3$ } from 'services/observables/apiData';
import { bancorMasterVault, bntToken } from 'services/web3/config';
import {
  APIPool,
  APIPoolV3,
  APIReward,
  PriceDictionary,
} from 'services/api/bancorApi/bancorApi.types';
import { calcFiatValue, toBigNumber } from 'utils/helperFunctions';
import { calcApr, shrinkToken } from 'utils/formulas';
import { standardRewardPrograms$ } from 'services/observables/standardRewards';
import {
  fetchLatestProgramIdsMulticall,
  RewardsProgramRaw,
} from 'services/web3/v3/portfolio/standardStaking';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
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
  apr_24h: number;
  apr_7d: number;
  reward?: APIReward;
  isProtected: boolean;
}

export interface APR {
  tradingFees: number;
  standardRewards: number;
  autoCompounding: number;
  total: number;
}

export interface PoolV3 extends APIPoolV3 {
  reserveToken: Token;
  apr24h: APR;
  apr7d: APR;
  programs: RewardsProgramRaw[];
  latestProgram?: RewardsProgramRaw;
  extVaultBalance: Pick<PriceDictionary, 'tkn' | 'usd'>;
  poolDeficit: BigNumber;
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
  const network_fees_24h = Number(apiPool.network_fees_24h.usd ?? 0);
  const fees_7d = Number(apiPool.fees_7d.usd ?? 0);
  const network_fees_7d = Number(apiPool.network_fees_7d.usd ?? 0);
  const apr_7d =
    liquidity && fees_24h ? calcApr(fees_7d - network_fees_7d, liquidity) : 0;
  const apr_24h =
    liquidity && fees_24h ? calcApr(fees_24h - network_fees_24h, liquidity) : 0;

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
    apr_7d,
    apr_24h,
    reward: apiPool.reward,
    isProtected,
  };
};

const buildPoolV3Object = (
  tokensMap: Map<string, Token>,
  apiPool?: APIPoolV3,
  reserveToken?: Token,
  latestProgramIdMap?: Map<string, string | undefined>,
  rewardsPrograms?: RewardsProgramRaw[],
  masterVaultBalances?: Map<string, string>,
  extVaultBalances?: Map<string, string>
): PoolV3 | undefined => {
  if (!apiPool || !reserveToken) {
    return undefined;
  }

  // ALL programs of this pool
  const programs = rewardsPrograms?.filter((p) => p.pool === apiPool.poolDltId);

  // The latest program
  const latestProgram = programs?.find(
    (p) => p.id === latestProgramIdMap?.get(apiPool.poolDltId)
  );

  // FIXES STAKED BALANCE = 0 WHEN TRADING ENABLED = FALSE
  const stakedBalance = { ...apiPool.stakedBalance };
  if (
    apiPool.tradingEnabled === false &&
    toBigNumber(stakedBalance.usd).isZero()
  ) {
    stakedBalance.usd = toBigNumber(apiPool.stakedBalance.tkn)
      .times(reserveToken.usdPrice)
      .toString();
  }

  // Calculate APR
  const standardRewardsApr24H = standardsRewardsAPR(
    apiPool,
    tokensMap,
    programs
  );
  const standardRewardsApr7d = standardsRewardsAPR(
    apiPool,
    tokensMap,
    programs
  );

  const tradingFeesApr24h = calcApr(
    new BigNumber(apiPool.fees24h.usd).minus(apiPool.networkFees24h.usd),
    stakedBalance.usd
  );
  const tradingFeesApr7d = calcApr(
    new BigNumber(apiPool.fees7d.usd).minus(apiPool.networkFees7d.usd),
    stakedBalance.usd,
    true
  );

  // TODO - add values once available
  const autoCompoundingApr24H = 0;
  const autoCompoundingApr7d = 0;

  const totalApr24H = toBigNumber(tradingFeesApr24h)
    .plus(standardRewardsApr24H)
    .plus(autoCompoundingApr24H)
    .toNumber();

  const totalApr7d = toBigNumber(tradingFeesApr7d)
    .plus(autoCompoundingApr7d)
    .plus(standardRewardsApr7d)
    .toNumber();

  // Master Vault Balances aka liquidity
  const tknVaultBalance = shrinkToken(
    masterVaultBalances?.get(apiPool.poolDltId) ?? '0',
    apiPool.decimals
  );

  const liquidity: Pick<PriceDictionary, 'tkn' | 'usd'> = {
    tkn: tknVaultBalance,
    usd: calcFiatValue(tknVaultBalance, reserveToken.usdPrice),
  };

  // External Vault Balances
  const tknExtVaultBalance = shrinkToken(
    extVaultBalances?.get(apiPool.poolDltId) ?? '0',
    apiPool.decimals
  );

  const extVaultBalance: Pick<PriceDictionary, 'tkn' | 'usd'> = {
    tkn: tknExtVaultBalance,
    usd: calcFiatValue(tknExtVaultBalance, reserveToken.usdPrice),
  };

  // Pool Deficit Percentage
  const poolDeficit = toBigNumber(liquidity.tkn)
    .plus(extVaultBalance.tkn)
    .div(stakedBalance.tkn)
    .minus(1)
    .times(100);

  return {
    ...apiPool,
    liquidity,
    extVaultBalance,
    poolDeficit,
    stakedBalance,
    apr24h: {
      tradingFees: tradingFeesApr24h,
      standardRewards: standardRewardsApr24H,
      autoCompounding: autoCompoundingApr24H,
      total: totalApr24H,
    },
    apr7d: {
      tradingFees: tradingFeesApr7d,
      standardRewards: standardRewardsApr7d,
      autoCompounding: autoCompoundingApr7d,
      total: totalApr7d,
    },
    reserveToken,
    programs: programs ?? [],
    latestProgram,
  };
};

export const standardsRewardsAPR = (
  apiPool: APIPoolV3,
  tokensMap: Map<string, Token>,
  programs?: RewardsProgramRaw[],
  seven_days?: boolean
) => {
  if (programs && programs.length) {
    return (
      programs
        // Only use APR from active programs
        .filter((p) => p.isActive)
        .reduce((acc, data) => {
          const rewardToken = tokensMap?.get(data.rewardsToken);
          const rewardRate = shrinkToken(
            data.rewardRate ?? 0,
            rewardToken ? rewardToken.decimals : 0
          );
          const rewardRateTime = toBigNumber(rewardRate)
            .times(60 * 60)
            .times(24)
            .times(seven_days ? 7 : 1);
          return (
            acc + calcApr(rewardRateTime, apiPool.standardRewardsStaked.bnt)
          );
        }, 0)
    );
  }

  return 0;
};

export const poolsV2$ = combineLatest([apiPools$, allTokensNew$]).pipe(
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
      const poolIds = apiPoolsV3.map((pool) => pool.poolDltId);

      const [
        latestProgramIds,
        masterVaultBalances,
        extVaultBalances,
        extVaultIsPaused,
      ] = await Promise.all([
        fetchLatestProgramIdsMulticall(apiPoolsV3),
        fetchTokenBalanceMulticall(poolIds, bancorMasterVault),
        fetchTokenBalanceMulticall(
          poolIds,
          ContractsApi.ExternalProtectionVault.contractAddress
        ),
        ContractsApi.ExternalProtectionVault.read.isPaused(),
      ]);

      const pools = apiPoolsV3.map((pool) =>
        buildPoolV3Object(
          tokensMap,
          pool,
          tokensMap.get(pool.poolDltId),
          latestProgramIds,
          standardRewardPrograms,
          masterVaultBalances,
          !extVaultIsPaused ? extVaultBalances : undefined
        )
      );

      return pools.filter((pool) => !!pool) as PoolV3[];
    }
  ),
  distinctUntilChanged<PoolV3[]>(isEqual),
  shareReplay(1)
);
