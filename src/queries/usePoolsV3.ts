import { PoolV3Chain, useV3ChainData } from 'queries/useV3ChainData';
import { useApiPoolsV3 } from 'queries/useApiPoolsV3';
import { useMemo } from 'react';
import { toBigNumber } from 'utils/helperFunctions';
import { calcApr } from 'utils/formulas';
import { standardsRewardsAPR } from 'services/observables/pools';
import { useApiTokensV3 } from 'queries/useApiTokensV3';
import { useBalances } from 'queries/useBalances';
import { utils } from 'ethers';

export const usePoolsV3 = () => {
  const chain = useV3ChainData();
  const apiPools = useApiPoolsV3();
  const apiTokens = useApiTokensV3();
  const balances = useBalances();

  const data = useMemo<PoolV3Chain[] | undefined>(() => {
    if (!chain.data) return undefined;
    const apiPoolsMap = new Map(apiPools.data?.map((p) => [p.poolDltId, p]));
    const apiTokensMap = new Map(apiTokens.data?.map((p) => [p.dltId, p]));
    return chain.data.map((x) => {
      const tknBalance = balances.data?.get && balances.data?.get(x.poolDltId);
      const bnTknBalance =
        balances.data?.get && balances.data?.get(x.poolTokenDltId);
      const pool: PoolV3Chain = {
        ...x,
        tknBalance: tknBalance
          ? utils.formatUnits(tknBalance, x.decimals)
          : undefined,
        bnTknBalance: bnTknBalance
          ? utils.formatUnits(bnTknBalance, x.decimals)
          : undefined,
      };
      const apiPool = apiPoolsMap?.get(x.poolDltId);
      const apiToken = apiTokensMap?.get(x.poolDltId);
      if (!apiPool || !apiToken) {
        return pool;
      }

      // FIXES STAKED BALANCE = 0 WHEN TRADING ENABLED = FALSE
      const stakedBalance = { ...apiPool.stakedBalance };
      if (
        apiPool.tradingEnabled === false &&
        toBigNumber(stakedBalance.usd).isZero()
      ) {
        stakedBalance.usd = toBigNumber(apiPool.stakedBalance.tkn)
          .times(apiToken.rate.usd)
          .toString();
      }

      // Calculate APR
      const standardRewardsApr24H = standardsRewardsAPR(apiPool, pool.programs);
      const standardRewardsApr7d = standardsRewardsAPR(apiPool, pool.programs);

      const tradingFeesApr24h = calcApr(apiPool.fees24h.usd, stakedBalance.usd);
      const tradingFeesApr7d = calcApr(
        apiPool.fees7d.usd,
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
      return {
        ...pool,
        ...{
          stakedBalance,
          fees24h: apiPool.fees24h,
          fees7d: apiPool.fees7d,
          volume7d: apiPool.volume7d,
          volume24h: apiPool.volume24h,
          standardRewardsStaked: apiPool.standardRewardsStaked,
          standardRewardsClaimed24h: apiPool.standardRewardsClaimed24h,
          standardRewardsProviderJoined: apiPool.standardRewardsProviderJoined,
          standardRewardsProviderLeft: apiPool.standardRewardsProviderLeft,
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
        },
      };
    });
  }, [apiPools.data, apiTokens.data, balances?.data, chain.data]);

  return { ...chain, data };
};
