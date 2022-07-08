import { useQuery } from 'react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTimeLow } from 'queries/queryOptions';
import {
  buildMulticallTradingLiquidity,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';
import { TradingLiquidityStructOutput } from 'services/web3/abis/types/BancorNetworkInfo';

export const useChainTradingLiquidity = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainCoreTradingLiquidity(poolIds?.length),
    () =>
      fetchMulticallHelper<TradingLiquidityStructOutput>(
        poolIds!,
        buildMulticallTradingLiquidity
      ),
    queryOptionsStaleTimeLow(!!poolIds)
  );
};
