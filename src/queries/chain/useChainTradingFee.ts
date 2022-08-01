import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'queries/queryKeyFactory';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { queryOptionsStaleTime2m } from 'queries/queryOptions';
import {
  buildMulticallTradingFee,
  fetchMulticallHelper,
} from 'services/web3/multicall/multicallFunctions';

export const useChainTradingFee = () => {
  const { data: poolIds } = useChainPoolIds();
  return useQuery(
    QueryKey.chainTradingFee(poolIds?.length),
    () => fetchMulticallHelper<number>(poolIds!, buildMulticallTradingFee),
    {
      ...queryOptionsStaleTime2m(!!poolIds),
      useErrorBoundary: true,
    }
  );
};
