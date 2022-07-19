import { useChainPrograms } from 'queries/chain/useChainPrograms';
import { toBigNumber } from 'utils/helperFunctions';
import { standardsRewardsAPR } from 'services/observables/pools';
import { calcApr } from 'utils/formulas';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiApr = ({ enabled = true }: Props = {}) => {
  const poolIds = useChainPoolIds();
  const apiPools = useApiPools({ enabled });
  const programsMap = useChainPrograms({ enabled });

  const data = new Map(
    poolIds.data?.map((id) => {
      const apiPool = apiPools.getApiPoolByID(id);
      const programs = programsMap.data?.get(id);

      if (!apiPool) {
        return [id, undefined];
      }
      // FIXES STAKED BALANCE = 0 WHEN TRADING ENABLED = FALSE
      const stakedBalance = { ...apiPool.stakedBalance };
      if (
        apiPool.tradingEnabled === false &&
        toBigNumber(stakedBalance.usd).isZero()
      ) {
        stakedBalance.usd = toBigNumber(apiPool.stakedBalance.tkn)
          // TODO - add apiToken.rate
          .times('0')
          .toString();
      }

      // Calculate APR
      const standardRewardsApr24H = standardsRewardsAPR(apiPool, programs);
      const standardRewardsApr7d = standardsRewardsAPR(apiPool, programs);

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

      const apr = {
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
      };
      return [id, { ...apr }];
    })
  );

  const getByID = (id: string) => data.get(id);

  return {
    data,
    getByID,
    isLoading: poolIds.isLoading || apiPools.isLoading || programsMap.isLoading,
    isFetching:
      poolIds.isFetching || apiPools.isFetching || programsMap.isFetching,
    isError: poolIds.isError || apiPools.isError || programsMap.isError,
  };
};
