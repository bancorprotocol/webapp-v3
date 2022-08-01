import { useChainPoolIds } from 'queries/chain/useChainPoolIds';

import { useApiPools } from 'queries/api/useApiPools';

interface Props {
  enabled?: boolean;
}

export const useApiTradingLiquidity = ({ enabled = true }: Props = {}) => {
  const poolIds = useChainPoolIds();
  const apiPools = useApiPools({ enabled });

  const data = new Map(
    poolIds?.data?.map((id) => [
      id,
      apiPools.getByID(id)
        ? {
            BNT: apiPools.getByID(id)!.tradingLiquidityBNT,
            TKN: apiPools.getByID(id)!.tradingLiquidityTKN,
          }
        : undefined,
    ])
  );

  const getByID = (id: string) => data.get(id);

  return {
    getByID,
    isLoading: poolIds.isLoading || apiPools.isLoading,
    isError: poolIds.isError || apiPools.isError,
    isFetching: poolIds.isFetching || apiPools.isFetching,
  };
};
